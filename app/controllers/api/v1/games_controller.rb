module Api
  module V1
    class GamesController < ApplicationController
      include ApplicationHelper
      require 'jwt'
      protect_from_forgery except: :create
      before_action :current_account
      before_action :find_game, only: %i[update_spiff get_game_data get_remote_data game_configurations_update
                                         active_song skip_and_add_song_current_game add_new_round update_state
                                         update_game_after_request get_leaderboard_data advance_song_in_game
                                         game_volume_request player_answers game_players player_playlist
                                         gifting_component pusher_update current_points trivia_ticket_score
                                         game_leaderboard player_answers reset_round_score reset_game update_appliance
                                         update_setting get_song_data get_filtered_song_count match_mates
                                         mayhem_spinner_update send_message]
      respond_to :json
      swagger_controller :games, 'Games'

      swagger_api :get_api_authentication_token do
        summary 'Login the User'
        param :query, :email, :string, :required, 'Email'
        param :query, :password, :string, :required, 'Password'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :index do
        summary 'Get the user dashboard details for launching game'
        param :header, 'Authentication', :string, :required, 'Authentication token'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :create do
        summary 'Create new Game with the account token'
        param :header, 'Authentication', :string, :required, 'Authentication token'
        param :query, 'game[playlist_id]', :string, :optional, 'Playlist Id'
        param :query, 'game[song_count]', :string, :optional, 'Song Count'
        param :query, 'game[campaign_id]', :string, :optional, 'Ad Profile Id'
        param_list :query, 'game[jukebox_mode]', :string, :required, 'Jukebox mode', %w[false true]
        param_list :query, 'game[skip_video]', :string, :required, 'Play Intro Video', %w[false true]
        param_list :query, 'game[background_music]', :string, :required, 'Play Background Music', %w[false true]
        param_list :query, 'game[open_session]', :string, :required, 'Open Session Mode', %w[false true]
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :update_game_after_request do
        summary 'Update the game when the user request'
        param :header, 'Authentication', :string, :required, 'Authentication token'
        param :query, 'game[code]', :string, :optional, 'Game Code'
        param :query, 'game[playlist_id]', :string, :optional, 'Playlist Id'
        param :query, 'game[song_count]', :string, :optional, 'Song Count'
        param :query, 'game[campaign_id]', :string, :optional, 'Ad Profile Id'
        param_list :query, 'game[jukebox_mode]', :string, :required, 'Jukebox mode', %w[false true]
        param_list :query, 'game[skip_video]', :string, :required, 'Play Intro Video', %w[false true]
        param_list :query, 'game[background_music]', :string, :required, 'Play Background Music', %w[false true]
        param_list :query, 'game[open_session]', :string, :required, 'Open Session Mode', %w[false true]
        param :query, 'game[round[song_ids]]', :string, :optional, 'Input Song Order IDs'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :game_code do
        summary 'Get last five Game Code'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :game_players do
        summary 'Get list of Players present in the Game'
        param :query, :game_code, :string, :optional, 'Game Code'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :demo do
        summary 'Create a demo Game'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :solo do
        summary 'Create a Solo Games'
        param :header, 'Authentication', :string, :required, 'Authentication token'
        param :query, :playlist_id, :string, :required, 'Playlist Id'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      # Request: /api/v1/games - GET Method
      def index
        if current_account
          @games =  current_account.games.order('created_at DESC').limit(10)
          @campaign = Campaign.joins(:assets).group('campaigns.id', 'campaigns.title').order('campaigns.title').count.map{|x| x.flatten}
          @current_games = Game.where(created_at: DateTime.now - 30.minutes..DateTime.now).order(created_at: :desc).limit(3)
          @game_id = current_account.players.last.game.id if current_account.players.present?
          [metrics, game_section, career_section, percent_calculator]
        else
          redirect_to root_path
        end
      end

      def account_setting
        percent_calculator
      end

      def game_history
        @played_games = []
        current_account&.players&.includes(:game,:guesses)&.each do |p|
          p_game = p.game
          details = {}
          details['game'] = p_game&.name || 'Unnamed'
          details['updated_at'] = p_game&.updated_at&.strftime('%m.%d.%y')
          details['score'] = p.total_score || 0
          @played_games << details
        end
      end

      def update_game_after_request
        return @updated_game = nil unless @game

        update_game_params(params)
        reselect_playlist_songs(game)
      end

      def active_camp_session
        campaign = params[:camp]
        if campaign
          os = OpenSession.where("name LIKE ?", "#{first_half(campaign.parameterize)}%").active_sessions.first
          render json: os
        end
      end

      def get_index_data
        return nil unless current_account

        game_history
        @games_played_count = @played_games.count
        @winning_percentage = @games_won&.zero? ? '0%' : (current_account.games_won.fdiv(@games_played_count) * 100).round(4).to_s + '%'
        @plan = current_account.subscription ? current_account.subscription.plan_name : 'freeplan'
        @muted = current_account&.muted
        metrics
      end

      def career_data
        @best_genre = current_account.best_genre ? current_account.best_genre : 'n/a'
        @best_era = current_account.best_era ? current_account.best_era : 'n/a'
        get_index_data
      end

      def current_points
        return nil unless @game && current_account

        @points = 0
        @players = current_account.players&.last
        if @players
          if @game.open_session
            @points = @players.current_round_score
          else
            @points = @players.total_score if @players.game_id == @game.id
          end
        end
      end

      def pusher_update
        return nil unless @game

        session = OpenSession.find_by_id(@game.session_id) if @game.session_id
        if @game.game_mode == 'Standard trivia'
          event_channel = 'slide_event'
        elsif @game.game_mode == 'Mayhem Mates'
          event_channel = 'mayhem_mates_event'
        else
          event_channel = 'game_event'
        end
        if session
          case params[:game][:status]
          when 'showPpt'
            Pusher["games_#{@game.id}"].trigger(event_channel,type: 'show_ppt')
          when 'openSlotMachine'
            MongoRound.create(round_id: @game.current_round.id, game_id: @game.id, game_code: @game.code, round_count: @game.rounds.count, playlist_id: @game.current_round.playlist_id, account_id: current_account&.id, action: 'Spin Slot Machine', actor: current_account&.name)
            Pusher["games_#{@game.id}"].trigger(event_channel, type: 'slot_machine', spiff_value: params[:game][:spiff_value])
          when 'markTicketAsRedeemed'
            ticket = Ticket.where(session_id: session.id,winner: true,redeemed: false).last
            ticket&.update(redeemed: true)
            if params[:game][:spiff_value] && ticket && ticket.number != 100
              spiff = Spiff.create(account_id: ticket.account_id, name: params[:game][:spiff_value], awarded_at:  DateTime.now.strftime('%B %d, %Y'))
              Pusher["games_#{@game.id}"].trigger(event_channel, type: 'drawing_winner', data: { account_id: ticket.account_id } )
              Pusher["games_#{@game.id}"].trigger(event_channel, type: 'rewards_updated', reward: 'spiff', account_id: ticket.account_id )
            end
            Pusher["games_#{@game.id}"].trigger(event_channel, type: 'close_slot_machine')
          when 'reSpinSlotMachine'
            MongoRound.create(round_id: @game.current_round.id, game_id: @game.id, game_code: @game.code, round_count: @game.rounds.count, playlist_id: @game.current_round.playlist_id, account_id: current_account&.id, action: 'Respin Slot Machine', actor: current_account&.name)
            Ticket.where(session_id: session.id).update_all(winner: false)
            Pusher["games_#{@game.id}"].trigger(event_channel, type: 'respin_slot_machine', spiff_value: params[:game][:spiff_value])
          when 'deleteTickets'
            Ticket.where(session_id: @game.session_id).destroy_all
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated')
          when 'gameOver'
            MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Game Over', actor: current_account&.name)
            session.update(active: false)
            Ticket.where(session_id: session.id).destroy_all
            @game.update(state: 'Game Over')
            Pusher["games_#{@game.id}"].trigger(event_channel, { type: "game_ended", data: {remote: true,game: @game.as_json, leaderboard: @game.leaderboard.as_json(methods: [:total_score, :logo] ).take(5)}.as_json })
          when 'guessEnd'
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'guess_end')
          when 'incrementSlide'
            old_question_number = @game.question_number
            @game.update(question_number: old_question_number + 1)
            Pusher["games_#{@game.id}"].trigger('slide_event', type: 'increment_slide')
          when 'decrementSlide'
            old_question_number = @game.question_number
            @game.update(question_number: old_question_number - 1)
            Pusher["games_#{@game.id}"].trigger('slide_event', type: 'decrement_slide')
          when 'allowPlayerGuess'
            Pusher["games_#{@game.id}"].trigger('slide_event', type: 'allowNextGuess')
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'allowNextGuess')
          when 'reloadGame'
            MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Reload Game', actor: current_account&.name)
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'reload_game')
          when 'pageRefresh'
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'page_refresh')
          when 'askPlayerContinue'
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'ask_player_continue')
          when 'startNextRound'
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'start_next_round')
          when 'openSpinWheel'
            if params[:game][:wheel_type] == 'Player Names'
              player_names = @game.current_round_score.delete_if { |h| h["total_score"] == 0 }.map {|p| p['name']}
              player_names += ['Mayhem Pass'] if player_names.count%2 != 0
            end
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'open_spin_wheel', data: { wheel_type: params[:game][:wheel_type], player_names: player_names })
          when 'startSpinWheel'
            MongoRound.create(round_id: @game.current_round.id, game_id: @game.id, game_code: @game.code, round_count: @game.rounds.count, playlist_id: @game.current_round.playlist_id, account_id: current_account&.id, action: 'Start Spin Wheel', actor: current_account&.name)
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'start_spin_wheel', data: { random_spin: params[:game][:random_spin]})
          when 'closeSpinWheel'
            Pusher["games_#{@game.id}"].trigger('game_event', type: 'close_spin_wheel')
          end
        else
          case params[:game][:status]
            when 'gameOver'
              MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Game Over', actor: current_account&.name)
              @game.update(state: 'Game Over')
              Pusher["games_#{@game.id}"].trigger(event_channel, { type: "game_ended", data: {remote: true,game: @game.as_json, leaderboard: @game.leaderboard.as_json(methods: [:total_score, :logo] ).take(5)}.as_json })
          end
        end
      end

      def gifting_component
        return nil unless @game

        @players = @game.players&.order(:name)
        if @game.session_id
          os = OpenSession.find(@game.session_id)
          if os&.series_id
            series = Series.find(os.series_id)
            @series = {name: series.name, active: os.name }
          end
        end
      end

      def background_music(playlist_id)
        if playlist_id == 0
          @songs_url = bcg_music_url
        else
          @songs_url = Playlist.find(playlist_id).songs.sample(7).map(&:public_url)
        end
      end

      def create
        return nil unless current_account

        @game = current_account.games.new(game_params)
        @game.game_mode = 'player_host' if current_account.role == 'player'
        @game.save
        round_update_params(params, @game)
        @rounds = @game.current_round
        background_music(@rounds.settings['background_music_playlist'] ? @rounds.settings['background_music_playlist'].to_i : 0) if @game.background_music
      end

      def current_round
        @game = Game.find_by_id(params[:round][:game_id])
        if @game && params[:round] && params[:round][:id]
          @game.current_round = Round.find(params[:round][:id]) || @game.rounds.last
          @game.state = 'Set Current Round'
          @game.save
        end
        get_round_songs(@game)
      end

      def create_session
        series_id = params[:game][:session][:sessionSeriesName] ? Series.find_by_name(params[:game][:session][:sessionSeriesName]).id : nil
        series = Series.where(campaign_id: params[:game][:campaign_id]).last
        series_id = series.id if series && series_id.nil?
        @session = OpenSession.create!(name: params[:game][:session][:name]&.parameterize, description: params[:game][:session][:description]&.parameterize, active: true,series_id: series_id,last_ticket: 100)
        MongoSession.create(session_id: @session.id, session_name: @session.name, series_id: @session.series_id, action: 'create', actor: current_account&.name, account_id: current_account&.id )
        @game.update(session_id: @session.id)
      end

      def player_answers
        return nil unless @game

        @answers = @game.player_answers.where(round_id: @game.current_round.id).order(:created_at).reverse.group_by(&:round_id) if @game.player_answers
      end

      def trivia_ticket_score
        return nil unless @game

        if @game.game_mode == 'Standard trivia'
          @ticket_score = []
          @game.players.each do |player|
            @ticket_score << { name: player.name, total_tickets: player.account.tickets.where(session_id: @game.session_id).count }
          end
          @ticket_score = @ticket_score.sort_by { |hsh| hsh[:total_tickets] }.reverse
        end
      end

      def player_playlist
        return nil unless @game
        Pusher["games_#{@game.id}"].trigger('game_event', type: 'update_players_selected_playlist', data: "#{params[:game][:playlist]}" )
        if @game.jukebox_mode
          @game.current_round.update(playlist_id: params[:game][:playlist]) if params[:game] && params[:game][:playlist]
        else
          @game.update(players_pick_redeemed: true,playlist_pick_redeemed:false,pick_account:nil)
        end
      end

      def create_series
        @series = Series.create!(name: params[:game][:session][:seriesData][:name],description: params[:game][:session][:seriesData][:description],active: true)
        MongoSeries.create(series_id: @series.id, series_name: @series.name, campaign_id: @series.campaign_id, action: 'create', actor: current_account&.name, account_id: current_account&.id ) if @series
        @session.update(series_id: @series.id)
      end

      def reset_round_score
        return nil unless @game

        @game.update(reset_round: @game.current_round.id)
        @game.round_wise_score
      end

      def reset_game
        return nil unless @game

        @game.update(state: 'Game Over')
        start_new_game
        @new_code = @game.code
      end

      def update_appliance
        return nil unless @game

        @campaign = Campaign.find(@game.campaign_id)
        @profile = GameProfile.find(@campaign.profile_id) if @campaign.profile_id
        @round = @game.current_round
        settings = @game.current_round.settings
        if @profile
          settings[:point_value] = @profile.point_value.to_s
          settings[:guess_timer] = @profile.guess_timer.to_s
          settings[:song_play_time] = @profile.song_play_time.to_s
          settings[:leaderboard_display_time] = @profile.leaderboard_display_time.to_s
          settings[:game_over_display_time] = @profile.game_over_display_time.to_s
          settings[:playlist_id] = @profile.playlist_id.to_s if @profile.playlist_id
        end
        settings[:playlist_id] = @campaign.playlist_id if @campaign.playlist_id
        settings[:song_count] = @campaign.song_count if @campaign.song_count  && @campaign.song_count > @game.not_skipped_song.count
        @game.update(profile_id: @campaign.profile_id ? @campaign.profile_id : @game.profile_id ,timer: @campaign.timer ? @campaign.timer * 0.01667 : @game.timer,
                     playlist_id:  @campaign.playlist_id ? @campaign.playlist_id : @game.playlist_id, background_music: @campaign.background_music,
                     automatic_song_advance: @profile ? @profile.automatic_song_advance : @game.automatic_song_advance, passive_mode: @campaign.player_pick_playlist || false)
        @round.update(settings: settings)
        if @campaign.jukebox || @game.jukebox_mode
          @game.update(jukebox_mode: @campaign.jukebox)
          update_setting
          if @game.state == 'Starting Game' && @game.players.count == 0
            @appliance_updated = true
          else
            game_configurations_update
          end
        end
      end

      def game_configurations_update
        return nil unless @game

        if params[:game] && params[:game][:game_mode] && params[:game][:game_mode] == 'Standard trivia'
          if params[:game][:session] &&  params[:game][:session][:name] && params[:game][:campaign_id] && !@game.session_id
           create_session
           @game.update(campaign_id: params[:game][:campaign_id])
          end
          update_setting
          create_trivia_round
          @game.update(trivia_params)
          MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Game Create', actor: current_account&.name) if @game.rounds.count == 1
          MongoRound.create(round_id: @game.current_round_id, game_id: @game.id, game_code: @game.code, round_count: @game.rounds.count, playlist_id: @game.current_round.playlist_id, account_id: current_account&.id, action: 'Create Trivia Round', actor: current_account&.name)
          Pusher["games_#{@game.id}"].trigger('game_event', type: 'standard_trivia_started')
        elsif params[:game] && params[:game][:game_mode] && params[:game][:game_mode] == 'Mayhem Mates'
          if params[:game][:session] &&  params[:game][:session][:name] && params[:game][:campaign_id] && !@game.session_id
           create_session
           @game.update(campaign_id: params[:game][:campaign_id])
          end
          update_setting
          create_mayhem_mates_round
          @game.update(mayhem_mates_params)
          MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Game Create', actor: current_account&.name) if @game.rounds.count == 1
          MongoRound.create(round_id: @game.current_round_id, game_id: @game.id, game_code: @game.code, round_count: @game.rounds.count, playlist_id: @game.current_round.playlist_id, account_id: current_account&.id, action: 'Create Mayhem Mates Round', actor: current_account&.name)
          Pusher["games_#{@game.id}"].trigger('game_event', type: 'mayhem_mates_started')
        else
          update_round_songs if params[:game][:song_order_ids]
          @rounds = @game.current_round
          @rounds.update(round_config_params)
          @game.update(session_id: params[:game][:session_id]) if params[:game][:session_id]
          create_session if params[:game][:session] &&  params[:game][:session][:name]
          create_series if params[:game][:session] && params[:game][:session][:seriesData] && params[:game][:session][:seriesData][:name] != nil
          round_update_params(params, @game) if params[:game][:profile] != 'SELECT PROFILE' && params[:game][:profile] != nil
          @game.update(game_config_params)
          update_player_limit(@game) if params[:game] && params[:game][:campaign_id]
          give_player_tickets_and_picks
          MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Game Create', actor: current_account&.name) if @game.rounds.count == 1
          MongoRound.create(round_id: @game.current_round_id, game_id: @game.id, game_code: @game.code, round_count: @game.rounds.count, playlist_id: @game.current_round.playlist_id, account_id: current_account&.id, action: 'Create Music Round', actor: current_account&.name)
          Pusher["games_#{@game.id}"].trigger('game_event', type: 'game_updated', data: "#{root_url}games/#{@game.code}", update: params[:game][:update])
        end
      end

      def update_setting
        return nil unless @game

        @rounds = @game.current_round
        settings = @rounds.settings
        settings['song_ids'] = '[]'
        @rounds.update(song_order_ids:[],settings: settings)
      end

      def create_trivia_round
        return nil unless @game

        @rounds = @game.current_round
        settings = @rounds.settings
        settings['background_music_playlist'] = params[:game][:background_music_playlist] if params[:game][:background_music] && params[:game][:background_music_playlist]
        settings['trivia'] = "true"
        @rounds.update(settings: settings)
      end

      def create_mayhem_mates_round
        return nil unless @game

        assign_word_to_players if params[:game][:mayhem_mates_words]
        @rounds = @game.current_round
        settings = @rounds.settings
        settings['background_music_playlist'] = params[:game][:background_music_playlist] if params[:game][:background_music] && params[:game][:background_music_playlist]
        settings['mayhem_mates'] = "true"
        @rounds.update(settings: settings)
      end

      def assign_word_to_players
        return nil unless @game

        players = @game.players
        mayhem_mates_words = params[:game][:mayhem_mates_words]
        players_count = players.count
        if players_count > 0
          if players_count <= 20
            (1..players_count/2).each do |i|
              if players.count != 3
                player_pair = players.sample(2)
                player_pair.each do |player|
                  player.update(mayhem_mates_word: mayhem_mates_words[i-1])
                end
                players -= player_pair
              else
                players.each do |player|
                  player.update(mayhem_mates_word: mayhem_mates_words[i-1])
                end
              end
            end
          else
            pair_length = (players_count.to_f/10).ceil
            (1..players_count/pair_length).each do |i|
              if players.count != pair_length + 1
                player_pair = players.sample(pair_length)
                player_pair.each do |player|
                  player.update(mayhem_mates_word: mayhem_mates_words[i-1])
                end
                players -= player_pair
              else
                players.each do |player|
                  player.update(mayhem_mates_word: mayhem_mates_words[i-1])
                end
              end
            end
          end
        end
      end

      def update_round_songs
       return nil unless @game

       @song_order_ids = params[:game][:song_order_ids]
       @rounds = @game.current_round
       settings = @rounds.settings
       settings['song_ids'] = @song_order_ids.map(&:to_i).to_s
       @rounds.update(song_order_ids: @song_order_ids, settings: settings)
      end

      def song_loaded
        @song_order_ids = params[:song_ids]
        @game = Game.find_by_code(params[:game])
        return unless params[:song] && params[:song][:id]

        @game.loaded_song = Song.find(params[:song][:id])
        @game.state = 'Song Loaded'
        @game.save
      end

      def get_leaderboard_data
        return nil unless @game

        if @game.open_session && @game.session_id
          leaderboard_data = @game.game_session_score
          @leaderboard = leaderboard_data[0].take(10)
          game_winner_reward(leaderboard_data[1],@game) if @game.winner_spiff
        else
          @leaderboard = @game.leaderboard.as_json(methods: %i[total_score logo]).take(5)
          game_winner_reward(@leaderboard[0]['account_id'],@game) if @game.winner_spiff
        end
      end

      def close_open_session
        if params[:session_id]
           OpenSession.find(params[:session_id]).update(active: false)
           Ticket.where(session_id: params[:session_id]).destroy_all
        end
      end

      def close_open_series
        params[:series_id] ? close_series_with_session : ''
      end

      def active_song
        return nil unless @game

        return unless params[:song] && params[:song][:id]
        song = Song.find(params[:song][:id])
        song_play = SongPlay.where(song_id: song.id,game_id: @game.id,skip_song: true).last
        if !song_play
          @game.current_song = SongPlay.create(song_id: song.id, game_id: @game.id, started_at: DateTime.now,round_id: @game.current_round_id)
          update_player_song_play(@game,song.id)
          @game.state = 'Active Song'
          @game.save
        end
      end

      def get_api_authentication_token
        hmac_secret = ENV['JwtSecret']
        account = Account.where(email: params[:email]).first
        if account&.valid_password?(params[:password])
          payload = { id: account.id }
          @token = JWT.encode payload, hmac_secret, 'HS256'
          @account = account.name
        else
          @account = 'Please enter correct details'
        end
      end

      def get_series_detail
        return unless params[:series_id].present?

        @series = Series.find_by_name(params[:series_id])
        @series_sessions = @series ? @series.open_sessions : nil
      end

      def skip_and_add_song_current_game
        return nil unless @game

        if ['Song Loaded', 'Active Song'].include? @game.state
          running_round = @game.current_round
          ap_song_ids = @game.already_played_song_ids.map(&:to_s)
          settings = running_round.settings
          if settings['eras'] && settings['genres']
            playlist_songs = running_round.playlist.get_filtered_songs(eval(settings['eras']), eval(settings['genres'])).map(&:to_s)
          else
            playlist_songs = running_round.playlist.songs.pluck(:id)&.map(&:to_s)
          end
          playlist_songs_count = playlist_songs.count
          current_round_songs = running_round.song_order_ids
          players_id = @game.players.pluck(:id)
          game_current_songs = current_round_songs + ap_song_ids
          if @game.random_play
            insert_song = (playlist_songs - game_current_songs).sample
          else
            insert_song = (playlist_songs - game_current_songs).first
          end
          inserted_song_id = JSON.parse(running_round.song_ids)
          song_id = @game.loaded_song_id
          unless insert_song.nil?
            song = Song.find(insert_song)
            sp = SongPlay.where(game_id: @game.id,song_id: song_id).last
            if sp && !sp.skip_song
              if song_id == sp&.song_id
                sp.update(skip_song: true)
              else
                song_play = SongPlay.find_or_initialize_by(game_id: @game.id,song_id: song_id,skip_song: true,round_id: @game.current_round_id)
                return nil unless song_play.save

                update_player_song_play(@game,song_id)
              end
              PlayerSongPlay.where(song_id: song_id, player_id: players_id).destroy_all
              inserted_song_id << insert_song.to_i
              current_round_songs << insert_song.to_s
              Round.where(game_id: @game.id).last.update(song_ids: inserted_song_id.to_s, song_order_ids: current_round_songs)
              @round = @game.current_round
              @game.loaded_song = get_next_song(@game.loaded_song_id, @round.song_order_ids)
              @game.state = 'Skip Song'
              @new_song = song if @game.save
              @songOrderIds = @game.current_round.song_order_ids
              get_remote_data
              render "api/v1/games/skip_song_data.jbuilder"
            end
          end
          rounds_left_songs_count = @game.song_countz - @game.not_skipped_song.count
          round_played_songs = playlist_songs - ap_song_ids
          remaining_song_count = round_played_songs.uniq.count - rounds_left_songs_count if playlist_songs_count > 0
          Pusher["games_#{@game.id}"].trigger('game_event', type: 'last_10_songs', remaining_song_count: "#{remaining_song_count}" ) if (remaining_song_count <=10 )
        end
      end

      def current_account
        if request.headers['Authentication']
          @token = request.headers['Authentication']
          hmac_secret = ENV['JwtSecret']
          decoded_token = JWT.decode @token, hmac_secret, true, algorithm: 'HS256'
          id = decoded_token.first['id']
          Account.find_by_id(id)
        else
          super
        end
      end

      def generate_playlist
        @playlists = Playlist.check_playlist(current_account)
        @playlist_data = Playlist.where(id: @playlists.map { |p| p[0]}).map { |x| {x.id => {"eras" => x.eras, "genres" => x.genres} } }.reduce Hash.new, :merge
        @playlists.unshift([0, 'SELECT PLAYLIST', 0])
        show_campaign
      end

      def get_series_summary
        @series = Series.where(name: params['series_name'], active: true)
        return nil unless @series.length > 0

        @total_players = []
        @last_session_winner = nil
        @max_score = 0
        players_total_score = []
        session_leaders = {}
         @series.last.open_sessions.includes(games: [players: :guesses]).each do |s|
           session_leaders = {}
           s.games.each do |g|
              @total_players += g.players.map(&:account_id)
              g.players.each do |p|
                p_total_score = p.total_score
                @max_score = p_total_score if p_total_score > @max_score
                session_leaders[p.name] ? session_leaders[p.name] += p.total_score : session_leaders[p.name] = p_total_score
              end
           end
           players_total_score.push(session_leaders)
         end
        players_total_score = players_total_score.inject{|memo, el| memo.merge( el ){|k, old_v, new_v| old_v + new_v}}
        players_total_score = players_total_score.to_a
        players_total_score.each do |x|
          x[0],x[1]=x[1],x[0]
        end
        if session_leaders.length > 0
          @last_session_winner = session_leaders.max_by{|k,v| v}
          @last_session_winner[0],@last_session_winner[1]=@last_session_winner[1],@last_session_winner[0]
        end
        @top_11 = players_total_score.sort.reverse.first(11)
        players_total_score = players_total_score.flatten
        players_total_score = players_total_score.each_slice(2).map(&:first)
        @avg_score = players_total_score.sum / players_total_score.length if players_total_score.length > 0
        render json: { series: @series, total_players: @total_players.uniq.count, avg_score: @avg_score ? @avg_score : 0 , max_score: @max_score ? @max_score: 0, top_11: @top_11, last_session_winner: @last_session_winner  }
      end

      def game_players
        return nil unless @game

        @game_players = @game.players.pluck(:account_id, :name)
        @game_players = [['Game Host', 'Game Host']] + @game_players if params[:game][:chat] && !current_account&.host?
        @all_players = @game_players.delete_if { |a| a[0] == current_account&.id }
      end

      def demo
        @account = Account.find_by(email: 'demo@user.com')
        @account ||= Account.create(email: 'demo@user.com', username: 'demouser', password: 'password')
        playlist = Playlist.where(name: 'Demo').last
        profile = GameProfile.where(name: 'Demo').last
        @game = Game.new(name: 'demo', account_id: @account.id, playlist_id: (playlist ? playlist.id : nil), profile_id: profile ? profile.id : 3)
        @game.save
        updated_hash = @game.current_round.settings
        updated_hash['song_count'] = playlist.songs.count
        @game.current_round.update(settings: updated_hash)
        @demo_player = Player.create(game_id: @game.id, name: 'demo', email: 'demo@user.com', account_id: @account.id)
      end

      def solo
        @account = current_account
        @playlist = Playlist.find(params[:game][:playlist_id])
        @profile = GameProfile.where(name: 'Demo').last
        @game = Game.new(name: 'solo', account_id: @account.id, song_count: 1, random_play: true, playlist_id: (@playlist ? @playlist.id : nil), profile_id: @profile ? @profile.id : 3)
        @game.save
        @game.to_json(include: %i[rounds loaded_song current_song current_round], methods: :already_played_song_ids)
        @rounds = @game.rounds
        @solo_player = Player.create(game_id: @game.id, name: @account.name, email: @account.email, account_id: @account.id)
        @solo_player.save
      end

      def add_new_round
        return nil unless @game

        send_round_mode_event if params['game']['round_mode']
        create_round  if @game.open_session
      end

      def start_new_game
        @prev_game = Game.find_by(code: params[:game][:code])
        songs_count = @prev_game.current_round.song_count
        attr = %w[game_mode account_id random_play background_music review_song timer automatic_song_advance jukebox_mode passive_mode profile_id]
        @game = Game.new(
          @prev_game.attributes.slice(
            *Game.attribute_names.select { |col| attr.include? col }
          )
        )
        @game.song_count = songs_count
        @game.playlist_id = ENV['DEFAULT_PLAYLIST_ID'] || 658
        if @prev_game.jukebox_mode && @prev_game.session_id && @prev_game.campaign
          series = Series.where(campaign_id: @prev_game.campaign.id).last
          session_id = get_session_name(@prev_game.campaign.title)
          OpenSession.find(session_id).update(series_id: series.id) if series && session_id
          @game.session_id = session_id || nil
          @game.open_session = session_id ? true : false
          @game.campaign_id = @prev_game.campaign_id
        end
        @game.save
        MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Start New Game', actor: current_account&.name)
        Pusher["games_#{@prev_game.id}"].trigger('game_event', type: 'start_new_game', data: "#{root_url}games/#{@game.code}")
        Pusher["games_#{@prev_game.id}"].trigger('slide_event', type: 'start_new_game', data: "#{root_url}games/#{@game.code}")
        @round = @game.current_round
        gp = GameProfile.find_by_id(@game.profile_id)
        @round.update(leaderboard_display_time: gp.leaderboard_display_time,point_value: gp.point_value,
        guess_timer: gp.guess_timer,song_play_time: gp.song_play_time,game_over_display_time:gp.game_over_display_time) if gp
        background_music(@round.settings['background_music_playlist'] ? @round.settings['background_music_playlist'].to_i : 0)
      end

      def check_game_code
        code = params[:game][:game_code].upcase
        game = Game.find_by_code(code)
        @game_exist = game || 'Invalid Game Code'
      end

      def update_state
        state = params[:game][:state]
        @rounds = @game.current_round
        @game.update(state: state)
      end

      def get_game_data
        return nil unless @game

        game_rounds = @game.rounds
        if game_rounds.last.id != @game.playlist_pick_round_id && @game.playlist_pick_redeemed
          player = Account.find_by_id(@game.pick_account)
          Pusher["games_#{@game.id}"].trigger('game_event', type: 'set_playlist_by_player', player: "#{player.id}",p_name: "#{player.name}",p_logo: "#{player.logo}" )
        end
        @round_count = game_rounds.count if game_rounds
        @current_account_games_played = current_account ?  current_account&.players.count : 0
        @total_songs_count = @game.song_countz
        @rounds = @game.current_round
        @state = @game.state
        @already_played_song_ids = @game.already_played_song_ids
        @current_session = OpenSession.find_by_id(@game.session_id)&.name if @game.session_id
        @player_limit_exceeds = @game.players.count >= @game.player_limit
        @series_name = nil
        if @game.session_id
          series = Series.where(campaign_id: @game.campaign_id, active: true)
          if series.count != 0
            @series_name = series.count == 1 ? series.last.name : series.second_to_last.name
          end
        end
        @current_profile = @game.current_profile
        background_music(@rounds.settings['background_music_playlist'] ? @rounds.settings['background_music_playlist'].to_i : 0)
        get_advertisement_images(@game) if @game.campaign_id
      end

      def get_remote_data
        return nil unless @game

        if @game.loaded_song
          s =  Song.find(@game.loaded_song.id)
          s = s.attributes.merge({issues: s.song_feedbacks.pluck(:issue).last, additional_data: s.additional_data})
          @current_song = (@game.state == 'Starting Game'|| @game.state == 'Game Updated') ? nil : s
          song_ids = @game.current_round.song_order_ids
          get_next_song(s,song_ids) if s
        end
        @song_count = @game.song_of_songs_count
      end

      def game_volume_request
        return nil unless @game

        if @game.state == "Standard trivia"
          Pusher["games_#{@game.id}"].trigger('slide_event', type: "volume_#{params[:volume]}")
        else
          Pusher["games_#{@game.id}"].trigger('game_event', type: "volume_#{params[:volume]}")
        end
      end

      def advance_song_in_game
        return nil unless @game

        return if @game.automatic_song_advance

        Pusher["games_#{@game.id}"].trigger('game_event', type: 'advance_next_song')
      end

      def launch_appliance
        return unless current_account && ( current_account.host? || current_account.admin? )

        jukebox = params[:game][:jukebox]
        playlist = Playlist.find_by_name(CGI.unescape(params[:game][:playlist])) if params[:game] && params[:game][:playlist]
        playlist_id = playlist.id if playlist
        pickPlaylist = params[:game][:pickPlaylist]
        timer = params[:game][:timer].fdiv(60) if params[:game] && params[:game][:timer]
        song_count = params[:game][:song_count]
        background =  params[:game][:background_music]
        gp = GameProfile.find_by_name(params[:game][:profile]) if params[:game][:profile]
        if gp
          song_count = song_count ? song_count : gp.song_count
          background = background ? background : gp.background_music
          playlist_id = playlist_id ? playlist_id : gp.playlist_id
          auto_advance = gp.automatic_song_advance
        end
        if params[:game][:campaign_id]
          camp_param = CGI.unescape(params[:game][:campaign_id])
          ad_profile = Campaign.find_by_title(camp_param)
          if ad_profile
            jukebox = ad_profile.jukebox  if ad_profile.jukebox && jukebox.nil?
            song_count = ad_profile.song_count if ad_profile.song_count && song_count.nil?
            background = ad_profile.background_music if ad_profile.background_music && background.nil?
            timer = ad_profile.timer*0.01666666666 if ad_profile.timer && timer.nil?
            playlist_id = ad_profile.playlist_id if ad_profile.playlist_id && playlist_id.nil?
            pickPlaylist = ad_profile.player_pick_playlist if ad_profile.player_pick_playlist && pickPlaylist.nil?
            gp = GameProfile.find(ad_profile.profile_id) if ad_profile.profile_id && gp.nil?
          end
          series = Series.where(campaign_id: ad_profile.id).last if ad_profile
          if series
            session_id = jukebox ? (ad_profile ? get_session_name(camp_param) : nil) : nil
            OpenSession.find(session_id).update(series_id: series.id) if session_id
          end
        end
        playlist_id = ENV['DEFAULT_PLAYLIST_ID'] || '658' if playlist_id.nil?
        appliance_game = Game.new(account_id: current_account.id, song_count: song_count || ENV['DEFAULT_SONG_COUNT'] || 11, game_mode: 'appliance',
                                  campaign_id: ad_profile ? ad_profile.id : nil, playlist_id: playlist_id,
                                  session_id: session_id || nil, open_session: session_id ? true : false,
                                  random_play: true, jukebox_mode: jukebox || false ,background_music: background || false,
                                  timer: timer || 1,automatic_song_advance: jukebox || auto_advance || false, passive_mode: pickPlaylist || false,
                                  profile_id: gp ? gp.id : 3)
        if appliance_game.save!
          @game = appliance_game
          MongoGame.create(game_id: @game.id, game_code: @game.code, session_id: @game.session_id, account_id: current_account&.id, action: 'Appliance Game Create', actor: current_account&.name)
        end
        @rounds = @game.current_round if @game
        @rounds.update(leaderboard_display_time: gp.leaderboard_display_time,point_value: gp.point_value,
        guess_timer: gp.guess_timer,song_play_time: gp.song_play_time,game_over_display_time:gp.game_over_display_time) if gp
        background_music(@rounds.settings['background_music_playlist'] ? @rounds.settings['background_music_playlist'].to_i : 0) if @game.background_music
      end

      def update_spiff
        return nil unless @game

        if params[:getSpiffValue]
          render json: {value: @game.winner_spiff}
        else
          @game.update(winner_spiff: params[:spiff])
          render json:{success: true}
        end
      end

      def get_song_data
        return nil unless @game

        if params['playlist_id'] && params['song_count']
          @game.update(state: 'Review Playlist', random_play: params[:game][:random_play])
          playlist_songs_ids = Playlist.find(params['playlist_id']).get_filtered_songs(params['eras'], params['genres'])
          playlist_songs_ids -= @game.already_played_song_ids
          if @game.random_play
            playlist_songs_ids = playlist_songs_ids.sample(params['song_count'].to_i)
          else
            playlist_songs_ids = playlist_songs_ids.first(params['song_count'].to_i)
          end
          @round = @game.current_round
          settings = @round.settings
          settings['song_ids'] = playlist_songs_ids.to_s
          settings['playlist_id'] = params['playlist_id']
          settings['song_count'] = params['song_count']
          settings['eras'] = params['eras']
          settings['genres'] = params['genres']
          @round.update(song_order_ids: playlist_songs_ids.map(&:to_s), settings: settings )
          playlist_songs = Song.where('id IN (?)', playlist_songs_ids).sort_by do |song|
            playlist_songs_ids.index(song.id)
          end
          render json: playlist_songs
        end
      end

      def get_filtered_song_count
        return nil unless @game
        if params['playlist_id'] && params['playlist_id'] != '0'
          filtered_song_ids = Playlist.find(params['playlist_id']).get_filtered_songs(params['eras'], params['genres'])
          filtered_song_ids -= @game.already_played_song_ids
          render json: { count: filtered_song_ids.count }
        end
      end

      def get_songs
        song_order_ids = params['song_order_ids'].map(&:to_i) if params['song_order_ids']
        songs_data = Song.find(song_order_ids)
        render json: songs_data
      end

      def match_mates
        return nil unless @game

        player = Player.find(params['player_id'])
        ids = @game.players.pluck(:id) - [params['player_id']]
        g_players = @game.players.where(id: ids)
        matched = false
        if player.mayhem_mates_word
          g_players.each do |g_player|
            name_matched = match_string(g_player.name, params['answer'], nil)
            if name_matched
              g_player.mayhem_mates_word == player.mayhem_mates_word ? matched = true : matched = false
              break
            end
          end
        end
        if matched
          session = OpenSession.find(@game.session_id)
          if session
            number = session.last_ticket
            count = 5
            while(count > 0)
             number += 1
             Ticket.create(account_id: player.account_id,session_id: session.id,number: number)
             count -= 1
            end
            session.update(last_ticket: number)
            Pusher["games_#{@game.id}"].trigger('mayhem_mates_event', type: 'rewards_updated', account_id: player.account_id, ticket_count: 5)
          end
        end
        render json: matched
      end

      def game_leaderboard
        return nil unless @game

        if @game.open_session
          @leaderboard = @game.current_round_score
        else
          @leaderboard = @game.leaderboard.as_json(methods: %i[total_score logo])
        end
        @songWinners = @game.players.includes(:guesses).sort {|x,y| y.current_song_score <=> x.current_song_score }.as_json(methods: :current_song_score )
      end

      def mayhem_spinner_update
        return nil unless @game

        case params[:result]
          when "SOLO"
            song_winners = @game.players.sort {|x,y| y.current_song_score <=> x.current_song_score }.as_json(methods: :current_song_score )
            player_ids = song_winners.map { |x| x["id"] }
            player_ids -= player_ids.first(5)
            player_ids.each do |pid|
              player = Player.find_by_id(pid)
              player.update(additional_points: player.additional_points + 25)
            end
          when "EQUALIZER"
            round_winners = @game.current_round_score
            player_ids = round_winners.map { |x| x["id"] }
            player_ids.first(5).each do |pid|
              player = Player.find_by_id(pid)
              if player.total_score > 0
                if player.total_score >= 25 && player.additional_points >= 0
                  player.update(additional_points: player.additional_points - 25)
                else
                  player.update(additional_points: -player.total_score)
                end
              end
            end
          when "MUTE"
            round_winners = @game.current_round_score
            player_ids = round_winners.map { |x| x["id"] }
            if !player_ids.empty?
              player = Player.find_by_id(player_ids.first)
              if player.total_score > 0
                if player.total_score >= 50 && player.additional_points >= 0
                  player.update(additional_points: player.additional_points - 50)
                else
                  player.update(additional_points: -player.total_score)
                end
              end
            end
        end
      end

      def send_message
        return nil unless @game && current_account

        Pusher["games_#{@game.id}"].trigger('game_event', type: 'new_message', data: { message_from: current_account.host? ? 'Game Host' : current_account.username, message_to: params[:game][:message_to], message: params[:game][:message] })
      end

      private

      def update_song_count(game)
        round = game.current_round
        settings = round.settings
        already_played_songs_count = game.not_skipped_song.count
        current_song_count = settings['song_count'].to_i
        total_rounds_count = game.rounds.count
        if total_rounds_count > 1
          song_count_sum = game.rounds.first(total_rounds_count - 1).map { |r| (!r.settings['trivia'] && !r.settings['mayhem_mates']) ? r.song_count.to_i : 0}.sum
          settings['song_count'] = current_song_count + already_played_songs_count - song_count_sum
        else
          settings['song_count'] = current_song_count + already_played_songs_count
        end
        round.update(settings: settings)
      end

      def give_player_tickets_and_picks
        session = @session || OpenSession.find_by_id(@game.session_id) if @game.session_id
        if session
          @game.players&.each do |p|
            acc = Account.find_by_id(p.account_id)
            if acc
              acc.increment!(:picks) if acc.tickets&.where(session_id: session.id).count == 0
              number = session.last_ticket + 1
              Ticket.create(account_id: p.account_id,session_id: session.id,number: number)
              session.update(last_ticket: number)
            end
          end
        end
      end

      def get_advertisement_images(game)
        @advertise_images = game.adv_url_and_type
        @advertise_time = game.campaign.duration
      end

      def get_next_song(current_song,song_list)
        next_song_id = song_list[song_list.find_index(current_song.to_s).next] if song_list&.find_index(current_song.to_s)
        @next_song = Song.find_by_id(next_song_id)
      end

      def close_series_with_session
        @series = Series.find(params[:series_id])
        @series.update(active: false)
        @series.open_sessions.update_all(active: false)
      end

      def create_round
        update_additional_points(@game)
        @round = @game.create_round
        @game.update(current_round_id: @round,state: 'Starting Game')
        Pusher["games_#{@game.id}"].trigger('game_event', type: 'new_round_added', data: "#{root_url}games/#{@game.code}" )
      end

      def send_round_mode_event
        @game.update(game_mode: params['game']['round_mode'])
        Pusher["games_#{@game.id}"].trigger('slide_event', type: 'standard_trivia_ended')
        Pusher["games_#{@game.id}"].trigger('mayhem_mates_event', type: 'mayhem_mates_ended')
        Pusher["games_#{@game.id}"].trigger('game_event', type: 'standard_trivia_ended' )
      end

      def career_section
        @current_account = current_account
        @current_account_logo = @profile = current_account.logo.url
        @plan = current_account.subscription ? current_account.subscription.plan_name : 'freeplan'
        @played_games = []
        current_account.players.each do |p|
          details = {}
          details['game'] = p.game.name || 'Unnamed'
          details['updated_at'] = p.game.updated_at.strftime('%m.%d.%y')
          details['score'] = p.total_score || 0
          @played_games << details
        end
        @games_played_count = @played_games.count
        @winning_percentage = @games_won&.zero? ? '0%' : (current_account.games_won.fdiv(@games_played_count).round(4) * 100).to_s + '%'
        @best_genre = current_account.best_genre ? current_account.best_genre : 'n/a'
        @best_era = current_account.best_era ? current_account.best_era : 'n/a'
        @games_won = current_account.games_won
      end

      def game_section
        @current_games_section = Game.where(created_at: [DateTime.now - 30.minutes..DateTime.now]).order(created_at: :desc).limit(3)
        @game_id = current_account.players.last ? current_account.players.last.game.id : 'undefined'
      end

      def metrics
        x = current_account.players.includes(:guesses).uniq
        score_sum = x.map(&:total_score)
        @max_score = score_sum.max
        @score = score_sum.sum
        @total_songs = score_sum.count
        @total_points = @score
        return @avg_points = 'n/a' unless @total_songs.positive? && current_account.songs_played.positive?

        @avg_points = @score.fdiv(current_account.songs_played).round(2)
      end

      def percent_calculator
        user_data = current_account&.slice(:name, :last_name, :email, :username, :city, :state, :zip_code, :phone)
        user_logo = {}
        user_logo['logo'] = current_account&.logo&.url&.include? 's3.amazonaws.com/music-mayhem/accounts/logos'
        user_data&.merge!(user_logo) if user_logo
        @percent = (user_data&.delete_if { |_k, v| v.blank? || v == false }&.count.to_f / 9 * 100).round(2)
      end

      def game_params
        params.require(:game).permit(:solo_game, :name, :campaign_id, :genre_id,
                                     :era_id, :song_count, :playlist_id, :passive_mode,
                                     :game_mode, :skip_video, :random_play, :review_song,
                                     :jukebox_mode, :background_music, :open_session,
                                     :game_type, :timer, :automatic_song_advance,
                                     :profile, :players_limit, :profile_id,
                                     game_constraints_attributes: %i[id game_id constraint_id constraint_type _destroy])
      end

      def round_update_params(params,game)
        profile_data = params[:game][:profile_data]
        profile = GameProfile.find_by_id(profile_data[:id])
        if profile_data
          game.current_round.update(point_value: profile&.point_value || profile_data[:point_value] ,
                                    guess_timer: profile&.guess_timer || profile_data[:guess_timer],
                                    song_play_time: profile&.song_play_time || profile_data[:song_play_time],
                                    leaderboard_display_time: profile&.leaderboard_display_time || profile_data[:leaderboard_display_time],
                                    game_over_display_time: profile&.game_over_display_time || profile_data[:game_over_display_time])
        end
      end

      def show_campaign
        @campaign = Campaign.joins(:assets).group('campaigns.id', 'campaigns.title').order('campaigns.title').count.map{|x| x.flatten}
        @campaign.unshift([0, 'SELECT VENUE TO PROCEED', 0])
      end

      def get_round_songs(game)
        @round = game.current_round
        song_order_idz = []
        @reviewd_songs = []
        @songs = @round.songs.shuffle
        @round.save
        @songs.each do |song|
          song.streaming_url
          song_order_idz << song.id
        end
        round_song_ids = eval(Round.find(@round.id).song_ids)
        @round.update(song_order_ids: round_song_ids)
        @reviewd_songs = Song.where(id: round_song_ids)
        update_song_count(game) if @round.songs.where(id: game.already_played_song_ids).count.zero?
      end

      def update_game_params(params)
        playlist   = Playlist.find(params[:game][:playlist_id]) if params[:game][:playlist_id]
        song_count = params[:game][:song_count] || round.song_count
        ad_profile = Campaign.find(params[:game][:campaign_id]) if params[:game][:campaign_id]
        background = params[:game][:background_music]
        skip_video = params[:game][:skip_video]
        open_session = params[:game][:open_session]
        jukebox_mode = params[:game][:jukebox_mode]
        @updated_game = game.update(campaign_id: ad_profile ? ad_profile.id : game.campaign_id,
                                    jukebox_mode: jukebox_mode, background_music: background, skip_video: skip_video,open_session: open_session )
        round.update(song_count: song_count, playlist_id: playlist ? playlist.id : round.playlist_id)
      end

      def reselect_playlist_songs(game)
        ids = CGI.unescape(params[:game][:round][:song_ids]) if params[:game][:round]
        round = game.rounds.last
        round.update(song_order_ids: ids, song_ids: ids)
        render json: { status: 200, code: round } if game.save
      end

      def get_session_name(adCampign)
        title = adCampign.parameterize
        time = Time.now.strftime("%m%d")
        name = title + '-' + time
        check_session = OpenSession.where("name LIKE ?", "%#{name}%").last
        if check_session&.active
          session_id = check_session.id
        elsif check_session && !check_session.active
          if check_session.name.split('-').length > 2
            session_name = check_session.name.gsub(/\d+$/) do |m|
              m.to_i + 1
            end
          else
            session_name = check_session.name + '-1'
          end
          session = OpenSession.create(name: session_name, active: true)
          MongoSession.create(session_id: session.id, session_name: session.name, series_id: session.series_id, action: 'create', actor: current_account&.name, account_id: current_account&.id )
          session_id = session.id
        else
          session = OpenSession.create(name: name, active: true)
          MongoSession.create(session_id: session.id, session_name: session.name, series_id: session.series_id, action: 'create', actor: current_account&.name, account_id: current_account&.id )
          session_id = session.id
        end
        session_id
      end

      protected

      def find_game
        @game = Game.find_by_code(params[:game][:code])
        game = @game
        [game, @game]
      end

      def update_player_limit(game)
        camp = Campaign.find_by_id(params[:game][:campaign_id])
        game.update(player_limit: camp.player_limit) if camp
      end

      def game_config_params
        params.require(:game).permit(
          :timer, :state, :campaign_id, :background_music, :session_id,
          :open_session, :automatic_round_advance, :remote_host_id,
          :automatic_song_advance, :profile_id, :show_title_hint, :show_artist_hint,
          :show_scoreboard, :random_play, :show_year_hint,:show_scoreboard,
          :random_play, :game_code_display, :round_leaderboard, :game_over_leaderboard
        )
      end

      def trivia_params
        params.require(:game).permit(:game_mode, :trivia_url,:state,:open_session, :background_music)
      end

      def mayhem_mates_params
        params.require(:game).permit(:game_mode, :state, :open_session, :background_music, :mayhem_mates_words =>[])
      end

      def round_config_params
        params.require(:game).permit(:song_count, :playlist_id, :session_id, :background_music_playlist)
      end
    end
  end
end
