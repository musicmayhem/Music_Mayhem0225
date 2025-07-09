module Api
  module V1
    class PlayersController < ApplicationController
      include ApplicationHelper
      protect_from_forgery :except => [:create]
      respond_to :json
      before_action :find_game, only: [:get_demo_data, :host_playlists, :redeem_pick, :check_player_present, :update_players_picks, :redeem_spiff, :redeem_ticket, :send_rewards, :tickets, :winner_ticket]
      swagger_controller :players, 'Players'

      swagger_api :create do
        summary 'Create player'
        param :header, 'Authentication', :string, :required, 'Authentication token'
        param :query, :game_code, :string, :optional, "Game Code"
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :players_game do
        summary 'Returns all Games Played by Player'
        param :header, 'Authentication', :string, :required, 'Authentication token'
      end

      swagger_api :show do
        summary 'Returns all Players in the Current Game'
        param :query, :code, :string, :required, "Game Code"
      end

      OTP_EXPIRATION_TIME = 5.minutes.ago
      def create
        @game = Game.find_by_code(params[:game_code])
        return nil unless @game && current_account
        check_user = current_account

        if @game.player_limit > @game.players&.count
          if check_user.present?
            @player = @game.players.new({:name => check_user.username, :email => check_user.email, :account_id => check_user.id})
            if @player.save
              MongoPlayer.create(player_id: @player.id, account_id: @player.account_id, game_id: @game.id, player_name: @player.name, player_email: @player.email)
              update_player_song_play(@game,@game.loaded_song_id) if @game.state == "Active Song"

              if @game.session_id
                check_user.increment!(:picks) if check_user.tickets&.where(session_id: @game.session_id).count == 0
                openn_session = OpenSession.find_by_id(@game.session_id)
                number = openn_session.last_ticket + 1
                Ticket.create(account_id: check_user.id,session_id: openn_session.id,number: number)
                openn_session.update(last_ticket: number)
              end
              if @game.jukebox_mode
                add_tag_to_player_mailchimp(check_user.email, 'JUKEBOX') if check_user&.confirmed? && email_list.include?(check_user.email)
                if @game.passive_mode && @game&.players&.count == 1
                  @game.update(player_limit: @game.campaign.player_limit) if @game.campaign_id
                  Pusher["games_#{@game.id}"].trigger('game_event', type: 'first_player_added', data: "#{root_url}games/#{@game.code}", account: check_user.id,p_name: "#{@player.name}",p_logo: "#{@player.logo}" )
                elsif @game&.players&.count == 1
                  @game.update(player_limit: @game.campaign.player_limit) if @game.campaign_id
                  Pusher["games_#{@game.id}"].trigger('game_event', type: 'first_player_added', data: "#{root_url}games/#{@game.code}" )
                end
              end
              session[:player_id] = @player.id
            else
              @player = "Player already present in the game"
            end
          end
          sign_in current_account
        else
          add_player_data_to_mailchimp(check_user)
        end
      end

      def get_random_name
        render json:{guestName: GuestusersController.guest_random_name}, status: 200
      end

      def total_score
        player = Player.find_by_id(params[:player][:id])
        return nil unless player

        render json: { total_score: player.current_round_score }
      end

      def gift_tickets
        player = Player.find_by_id(params[:ticket][:player_id])
        game = Game.find_by_id(params[:ticket][:game_id])
        session = game.session_id ? OpenSession.find_by_id(game.session_id) : nil
        if player && game
          number = session.last_ticket + 1
          Ticket.create!(account_id: player.account_id,number: number,session_id: game.session_id)
          session.update(last_ticket: number)
          Pusher["games_#{game.id}"].trigger('slide_event', type: 'tickets_updated',data: player.id)
        end
      end

      def get_demo_data
        return nil unless @game

        @player = @game.players.last
      end

      def series_score
        session_id = current_account.players_session_id
        series_id = OpenSession.where(id: session_id).pluck(:series_id).compact.uniq
        series_data = []
        series = Series.where(id: series_id)
        series.includes(open_sessions: :games).each do |s|
          code = []
          s.open_sessions.each do |os|
            code << os.games.pluck(:code)
          end
          s = s.attributes.merge({code: code.length > 1 ? code.uniq.join('|') : code})
          series_data << s
        end
        render json: {series: series_data}
      end

      def songs_played
        return nil unless current_account

        if current_account.players && current_account.players.count.zero?
          @player_song_count = 0
        else
          @player_song_count = current_account.players.last.player_song_plays.count
        end
        @game_round_count = current_account.current_player_rounds_played
        @song_play_count = current_account.songs_played
        @round_count = current_account.rounds_played
        @games_played = current_account.games_played
      end

      def resend_email_confirmation
       account = Account.find_by_email(params[:email])
       @player = account.resend_confirmation_instructions if account
      end
      
      def verify_otp
        @account = Account.find_by_email(params[:email])
        print @account.id
        if @account && @account.confirmation_token == params[:otp] && @account.confirmation_sent_at >= OTP_EXPIRATION_TIME
          @account.confirm
          @account.update(confirmation_token: nil)
          sign_in @account
          render 'api/v1/players/verify_otp', status: :ok
        else
          render json: { error: 'Invalid OTP' }, status: :not_found
        end
      end
      
      def send_email_to_players
        return nil if !current_account.host?
        series = ScoreTable.where(series_id: params[:series])
        series.each do |s|
          UserMailer.score_mailer(s.p_name,s.rank,s.score,s.p_email).deliver
        end
        @status = true
      end

      def set_playlist
        player = Player.find_by_id(params[:player][:id])
        Pusher["games_#{player.game.id}"].trigger('game_event', type: 'set_playlist_by_player', player: "#{player.id}",p_name: "#{player.name}",p_logo: "#{player.logo}" )
        render :json => nil
      end

      def send_host_answer
        player = Player.find_by_id(params[:player][:id])
        return nil unless player
        if player.game&.game_mode == 'Standard trivia'
          answer = player.player_answers.where(p_name: player.name,game_id: player.game_id,round_id: player.game.current_round.id ,question_number: player.game.question_number)
          if answer && answer.length == 0
            player.player_answers.create!(p_name: player.name,game_id: player.game_id,round_id: player.game.current_round.id ,answer: params[:player][:answer],question_number: player.game.question_number)
            Pusher["games_#{player.game.id}"].trigger('game_event', type: 'answers_updated', player_id: player.account_id )
          end
        elsif player.player_answers&.length < player.game.rounds.count
          player.player_answers.create!(p_name: player.name,game_id: player.game_id,round_id: player.game.current_round.id ,answer: params[:player][:answer])
          Pusher["games_#{player.game.id}"].trigger('game_event', type: 'answers_updated' )
        end
      end

      def players_game
        @players_game = Player.where(email: current_account.email)
      end

      def current_account
        if request.headers['Authentication']
          @token = request.headers['Authentication']
          hmac_secret = ENV['JwtSecret']
          decoded_token = JWT.decode @token, hmac_secret, true, { algorithm: 'HS256' }
          id = decoded_token.first['id']
          Account.find_by_id(id)
        else
          super
        end
      end

      def check_player_present
        return nil unless @game

        @player = Player.find_by(game_id: @game.id, account_id: params[:player][:account_id])
        @intro_redeemed = current_account&.intro_redeemed || false
      end

      def find_scores
        series = Series.find(params[:game][:code])
        return nil unless series
        data = {}
        session_hash = {}
        series.open_sessions.includes(games: [players: :guesses]).each do |os|
        session_hash[os.id.to_s + os.name]={}
         os.games.each do |g|
         session_hash[os.id.to_s + os.name][g.id]={}
           g.players.each do |p|
             session_hash[os.id.to_s + os.name][g.id][p.name] = p.total_score
           end
         end
         session_hash[os.id.to_s + os.name] = session_hash[os.id.to_s + os.name].length > 1 ? session_hash[os.id.to_s + os.name].values.inject{|memo, el| memo.merge( el ){|k, old_v, new_v| old_v + new_v}} : session_hash[os.id.to_s + os.name].values.inject
         session_hash[os.id.to_s + os.name] = session_hash[os.id.to_s + os.name].sort_by {|_key, value| -value}.to_h if session_hash[os.id.to_s + os.name]
        end
        data['session'] = session_hash
        data['series'] = session_hash.length > 1 ? session_hash.values.compact.inject{|memo, el| memo.merge( el ){|k, old_v, new_v| old_v + new_v}} : session_hash.values.inject
        data['series'] = data['series'].sort_by {|_key, value| -value}.to_h if data['series']
        @series_wise_score = data['series']
        @series_score = data['session']
      end

      def check_player_present_in_last_game
        if current_account && current_account.players
          game_code = Account.find(current_account.players.last.game.account_id).games.last.code if current_account.players.last
          if params[:game_code] == game_code
            @present = true
          else
            @present = false
          end
        end
      end

      def check_player_name
        if Account.find_by_username(params[:player][:name]) && !(Account.find_by_username(params[:player][:name]) == current_account)
           render json: { playerFound: true }
         else
           render json: { playerFound: false }
         end
       end

       def update_players_picks
         return nil unless @game && current_account

         friend_account = Account.find_by_username(params[:players][:friend_name])
         if friend_account
           friend_account.increment!(:picks)
           current_account.update(intro_redeemed: true, picks: current_account.picks + 1)
           Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', gifted_by: "#{current_account.username}", gifted_to: "#{friend_account.username}", reward: 'pick', account_id: current_account.id)
         end
       end

       def rewards
         return nil unless current_account

         spiffs = current_account.spiffs.order_by_redemption
         @tickets = current_account.tickets.where(session_id: params[:session_id])&.sort if params[:session_id]
         @picksCount = current_account.picks
         @spiffs = spiffs
         @spiffsCount = spiffs.not_redeemed.count
         @status = current_account.status
       end

       def unmute_player
         if params[:game] && params[:status] == 'muted'
           current_account&.update(status: 'unmute')
         end
         @status = current_account&.status
       end

       def host_playlists
         return nil unless @game
         @playlist = Playlist.joins(:songs).where("access = 'personal'").where('songs.active = true').group("playlists.id", "playlists.name").order("playlists.name").count.map{|x| x.flatten}
       end

       def redeem_pick
         return nil unless @game && current_account

         @tickets = nil
         @lastPickRedeemed = params[:pick]
         old_pick_value = current_account.picks
         if current_account.picks > 0
           case @lastPickRedeemed
           when 'Mute Player'
            muted_player = params[:muted_player]
            if muted_player && muted_player !="" && !(['Song Loaded', 'Active Song'].include? @game.state)
              muted_player = Account.find(muted_player)
              if muted_player.status != "muted"
                muted_player_name = muted_player.username
                mute_count = muted_player.muted
                muted_player.update(status: 'muted', muted: mute_count + 1)
                Pusher["players_guess_data_#{@game.id}"].trigger('player_guess_event', type: 'player_muted', current_account: "#{current_account.username}", muted_player: "#{muted_player_name}", muted_player_account_id: muted_player.id)
                current_account.update(picks: current_account.picks - 4) if (current_account.picks != 0)
              end
            end
           when 'Free Ride'
             if ['Song Loaded', 'Active Song'].include? @game.state
               player = current_account.players&.last
               score = @game&.current_round&.settings['point_value'].to_i
               player_guess = player&.guesses.where(song_play_id: @game.current_song.id).last
               if player_guess.present?
                 if !@game.show_year_hint && player_guess.artist_score != score && player_guess.title_score != score
                   player_guess.update(artist_score: score, title_score: score)
                   current_account.update(picks: current_account.picks - 2)
                 elsif @game.show_year_hint && player_guess.artist_score != score && player_guess.year_score != score
                   player_guess.update(artist_score: score, year_score: score)
                   current_account.update(picks: current_account.picks - 2)
                 else
                   @pickRedeemedPreviously = true
                 end
               else
                 guess = player.guesses.new(
                   artist_score: score,
                   title_score: !@game.show_year_hint ? score : 0,
                   year_score: @game.show_year_hint ? score : 0,
                   song_play_id: @game.current_song.id,
                   round_id: @game.current_round_id,
                   account_id: player.account_id
                 )
                 if guess.save
                   current_account.update(picks: current_account.picks - 2)
                 end
               end
             end
           when 'Pick Playlist'
             if !@game.playlist_pick_redeemed
               current_account.update(picks: current_account.picks - 3) if (current_account.picks != 0)
               @game.update(playlist_pick_round_id: @game.rounds.last.id,playlist_pick_redeemed: true,pick_account: current_account.id,players_pick_redeemed: false)
               Pusher["players_guess_data_#{@game.id}"].trigger('player_guess_event', type: 'update_player_pick', data: current_account.username)
             end
           when 'Sneak Peek'
             if ['Song Loaded', 'Active Song'].include? @game.state
               current_account.update(picks: current_account.picks - 1) if (current_account.picks != 0)
             end
           when 'Buy Tix'
             session = @game.session_id ? OpenSession.find_by_id(@game.session_id) : nil
             if session
               last_ticket_number = session.last_ticket
               (1..5).each do |t|
                 last_ticket_number +=1
                 Ticket.create(account_id: current_account.id,session_id: session.id,number: last_ticket_number)
               end
               session.update(last_ticket: last_ticket_number)
               @tickets = current_account.tickets.where(session_id: session.id)&.sort
               current_account.update(picks: current_account.picks - 1) if current_account.picks != 0
             end
           end
           Pusher["games_#{@game.id}"].trigger('game_event', type: 'pick_redeemed', player_name: current_account.username, pick_type: @lastPickRedeemed )
           @pickRedeemed  = old_pick_value != current_account.picks ? 1 : 2
           @picks = current_account.picks
         end
       end

       def redeem_spiff
         return nil unless @game

         if params[:spiff_id]
           spiff = Spiff.find_by_id(params[:spiff_id])
           spiff&.update(redeemed_at: DateTime.now.strftime('%B %d, %Y'))
           Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated') if spiff
         end
       end

       def redeem_ticket
         return nil unless @game

         session = OpenSession.find_by_id(@game.session_id) if @game.session_id
         @tickets = nil
         if params[:number] && session
           ticket = Ticket.find_by_id(params[:number])
           if params[:spiff_value] && ticket&.number != 100 && !ticket&.redeemed
             ticket&.update(redeemed: true)
             spiff = Spiff.create(account_id: ticket.account_id, name: params[:spiff_value], awarded_at:  DateTime.now.strftime('%B %d, %Y'))
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'drawing_winner', data: { account_id: ticket.account_id } )
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'spiff', account_id: ticket.account_id )
           elsif ticket&.number != 100 && !ticket&.redeemed
             ticket&.update(redeemed: true)
           end
           @tickets = ticket&.account&.tickets&.where(session_id: session.id)&.sort
           Pusher["games_#{@game.id}"].trigger('game_event', type: 'close_slot_machine')
           Pusher["games_#{@game.id}"].trigger('slide_event', type: 'close_slot_machine')
           Pusher["games_#{@game.id}"].trigger('mayhem_mates_event', type: 'close_slot_machine')
         end
         if params[:ticket] && params[:ticket][:winner] && session
           ticket = Ticket.where(session_id: session.id,number: params[:ticket][:winner]).last
           if ticket
             Ticket.where(session_id: session.id).update_all(winner: false)
             ticket.update(winner: true)
             @tickets = ticket.account.tickets&.where(session_id: session.id)&.sort
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'slot_machine',data: true, spiff_value: params[:ticket][:spiff_value])
           end
         end
       end

       def send_rewards
         return nil unless @game

         type = params[:gift][:type]
         value = params[:gift][:value]
         session = @game.session_id ? OpenSession.find_by_id(@game.session_id) : nil
         if params[:gift][:all]
           case type
           when 'Points'
             @game.players.each do |p|
               if p.guesses.count > 0 && p.guesses.last.round_id == @game.current_round.id
                 p.guesses.last.update(additional_points: p.guesses.last.additional_points + value.to_i)
               else
                 p.update(additional_points: p.additional_points + value.to_i)
               end
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'points', account_id: 'all', count: params['gift']['value'].to_i)
           when "Tickets"
             @game.players.each do |p|
               (1..value.to_i).each do |t|
                 if session
                   number = session.last_ticket + 1
                   Ticket.create(account_id: p.account_id,session_id: session.id,number: number)
                   session.update(last_ticket: number)
                 end
               end
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'ticket', account_id: 'all', count: params['gift']['value'].to_i)
           when "Picks"
             @game.players.includes(:account).each do |p|
               acc = p.account
               acc.update(picks: acc.picks + 1)
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'pick', account_id: 'all', count: 1)
           when "Spiffs"
             @game.players.each do |p|
                Spiff.create(account_id: p.account_id, name: value, awarded_at:  DateTime.now.strftime('%B %d, %Y'))
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'spiff', account_id: 'all', count: 1)
           end
         else
           p_ids = params[:gift]&.keys&.map(&:to_i)
           players = Player.where(id: p_ids)
           account_ids = players.pluck(:account_id)
           case type
           when "Tickets"
             players.each do |p|
               (1..value.to_i).each do |t|
                 if session
                   number = session.last_ticket + 1
                   Ticket.create(account_id: p.account_id,session_id: session.id,number: number)
                   session.update(last_ticket: number)
                 end
               end
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'ticket', account_id: account_ids, count: params['gift']['value'].to_i )
           when "Spiffs"
             players.each do |p|
               Spiff.create(account_id: p.account_id, name: value, awarded_at:  DateTime.now.strftime('%B %d, %Y'))
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'spiff', account_id: account_ids, count: 1)
           when "Points"
             players.each do |p|
               if p.guesses.count > 0 && p.guesses.last.round_id == @game.current_round.id
                 p.guesses.last.update(additional_points: p.guesses.last.additional_points + value.to_i)
               else
                 p.update(additional_points: p.additional_points + value.to_i)
               end
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'points', account_id: account_ids, count: params['gift']['value'].to_i )
           when "Picks"
             players.each do |p|
               acc = p.account
               acc.update(picks: acc.picks + 1)
             end
             Pusher["games_#{@game.id}"].trigger('game_event', type: 'rewards_updated', reward: 'pick', account_id: account_ids, count: 1)
           end
           @status = "Gifts Send Successfully"
         end
       end

       def tickets
         return nil unless @game

         if @game.session_id
           round_id = @game.current_round.id
           if(@game.game_mode == 'Standard trivia')
             acc=[]
             @game.player_answers.where(round_id: round_id).each do |answer|
               acc = acc.push(answer.player.account_id)
             end
             acc = acc.uniq.compact
           elsif (@game.game_mode == 'Mayhem Mates')
             acc = @game.players.pluck(:account_id)
           else
             acc = Guess.where(round_id: round_id).pluck(:account_id).uniq.compact
           end
           @ticket_number = Ticket.where(session_id: @game.session_id, account_id: acc, redeemed: false).pluck(:number).sample || 100
           @ticket_number = @ticket_number < 1000 ? '0' + @ticket_number.to_s : @ticket_number.to_s
           Pusher["games_#{@game.id}"].trigger('game_event', type: 'ticket_number', data: @ticket_number.split("").map(&:to_i))
         end
       end

       def winner_ticket
         return nil unless @game

         session = OpenSession.find_by_id(@game.session_id)
         @ticket = Ticket.where(number: params[:ticket],session_id: session.id).last if params[:ticket] && session
       end

      private

      def find_game
        @game = Game.find_by_code(params[:game][:code])
      end

      def add_player_data_to_mailchimp(check_user)
        Pusher["games_#{@game.id}"].trigger('game_event', type: 'player_limit_exceeded', player_id: check_user.id)
        if @game.jukebox_mode
          add_tag_to_player_mailchimp(check_user.email, 'JUKEBOX') if check_user&.confirmed? && email_list.include?(check_user.email)
        end
        add_tag_to_player_mailchimp(check_user.email, @game.campaign.title) if check_user&.confirmed? && email_list.include?(check_user.email) && @game.campaign
      end

    end
  end
end
