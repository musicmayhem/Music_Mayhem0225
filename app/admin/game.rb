ActiveAdmin.register Game do
  config.per_page = [20, 50, 100, 200]
  menu parent: 'Game Management'

  filter :state
  filter :username
  filter :device
  filter :remote_host_id, label: 'host id'
  filter :campaign
  filter :launched, label: 'launch date', as: :date_range
  filter :open_session

  controller do
    before_action :set_timezone

    def resource
      if action_name == 'new' || action_name == 'create'
        super
      else
        Game.find_by_code(params[:id])
      end
    end

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end

  action_item :my_action, only: :show do
    link_to 'Download Trivia Answers', admin_all_player_trivia_answers_path(format: 'xls', game_code: resource.code), disable_with: "Downloading...", method: :post
  end

  batch_action :add_to_session, form: ->{ {session: OpenSession.active_sessions.pluck(:name)} } do |ids, inputs|
    session = inputs['session']
    if session
      s_id = OpenSession.find_by_name(session).id
      Game.where(id: ids).update_all(session_id: s_id)
      redirect_back fallback_location: root_path, :flash => { :alert => "Session Added to the game" }
    end
  end

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "games"}
    selectable_column
    column :id
    column :game do |item|
      link_to item.name, [:admin, item]
    end
    column :state
    column :session_id
    column :device do |game|
      link_to game.account.try(:username), admin_account_path(game.account.id) if game.account.present?
    end
    column :host do |game|
      link_to Account.find_by_id(game.remote_host_id).username, admin_account_path(game.remote_host_id) if game.remote_host_id.present?
    end
    column :campaign_id do |game|
      if Campaign.exists?(id: game.campaign_id)
        link_to Campaign.find_by_id(game.campaign_id).title, admin_campaign_path(game.campaign_id) if game.campaign_id.present?
      end
    end
    column :players do |game|
      game&.players&.count
    end
    column :songs do |game|
      game&.song_plays&.count
    end
    column :launched, sortable: :created_at do |game|
      game&.created_at&.strftime("%Y.%m.%d  %I:%M%p")
    end
    column :updated, sortable: :updated_at do |game|
      game&.updated_at&.strftime("%Y.%m.%d  %I:%M%p")
    end
    actions
  end

  show do |game|
    attributes_table do
      row :id
      row :name
      row :code
      row :account
      row :reward
      row :passive_mode
    end

    resource.players.each.with_index(1) do |p,i|
      panel "Player #{i}" do
        table_for p do
          column :name do |item|
            if item&.account_id
              acc = Account.find_by_id(item.account_id)
              link_to acc.username, [:admin, acc] if acc
            end
          end
          column :guess_score do |item|
            p.guesses.pluck(:title_score).sum + p.guesses.pluck(:artist_score).sum
          end
          column :additional_points do |item|
            p.additional_points + p.guesses.pluck(:additional_points).sum
          end
          column :total_score do |item|
            p.total_score
          end
        end
        table_for p.guesses.each do |ps|
          column :song_play_id do |sp|
            link_to SongPlay.find_by_id(sp.song_play_id).song.title, [:admin, SongPlay.find_by_id(sp.song_play_id).song]
          end
          column :score do |sp|
            sp.artist_score + sp.title_score
          end
        end
        table_for p.player_answers.each do |pa|
          column :question_number do |pa|
            pa.question_number
          end
          column :trivia_answer do |pa|
            pa.answer
          end
        end
      end
    end

    resource.rounds.each.with_index(1) do |round, i|
      panel "Round #{i}" do
        table_for round do
          column :song_count
          column :total_play_length
          column :letter_start_time
          column :guessing_length
          column :guessing_percentage
          column :fade_out_length
          column :playlist
          column :eras
          column :genres
          column :manual_control do
            round.manual_control == '1'
          end
        end
        table_for round.songs.each do |song|
          column :title do |song|
            link_to song.title, [:admin, song]
          end
          column :artist
          column :length_in_seconds
          column :year
          column :genres do |song|
            song.genres.collect{ |g| link_to g.name, [:admin, g] }.join(', ').html_safe
          end
        end
      end
    end
  end

  form do |f|
    f.inputs :name
    f.inputs :account
    f.inputs :code
    f.inputs :reward
    f.inputs :passive_mode
    f.inputs do
      f.has_many :rounds, :allow_destroy => true, :heading => 'Rounds' do |a|
        a.input :manual_control, as: :boolean
        a.input :allowed_to_continue
        a.input :song_count
        a.input :total_play_length
        a.input :letter_start_time
        a.input :guessing_length
        a.input :guessing_percentage
        a.input :fade_out_length
        a.input :playlist_id, as: :select, collection: Playlist.all
        a.input :era_ids, as: :select, collection: Era.all
        a.input :genre_ids, label:'Genres', as: :select, collection: Genre.all, multiple: true, input_html: {class: 'select2-enabled'}
      end
    end

    f.actions :commit
  end

  permit_params :name, :code, :reward, :account_id, :era_id, :playlist_id, genre_ids: [], rounds_attributes: [:id, :top_percentage, :era_id, :genre_ids, :_destroy, :manual_control, :song_count, :total_play_length, :letter_start_time, :fade_out_length, :guessing_length, :guessing_percentage, :song_play_time, :playlist_id, :allowed_to_continue ]
end
