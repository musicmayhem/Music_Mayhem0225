ActiveAdmin.register SongFeedback do
  menu label: 'Flagged Songs'

  menu parent: 'Song Management'

  filter :issue
  filter :name
  filter :created_by

  controller do
    before_action :set_timezone

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end


  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "song_feedbacks"}
    selectable_column
    column :song_id do |s|
      link_to s.song_id, admin_song_path(s.song_id) if s.song_id
    end
    column :game_id do |g|
      link_to g.game_id, admin_game_path(g.game.code) if g.game
    end
    column :name
    column :issue
    column :created_by
    column :created_at
    actions
  end

  show do |song_feedbacks|
    attributes_table do
      row :song_id
      row :game_id
      row :name
      row :issue
      row :created_by
    end
  end

  form do |f|
    f.inputs "FLAGGD SONG" do
      f.input :song_id
      f.input :game_id
      f.input :name
      f.input :issue
      f.input :created_by, :label => 'Role', :as => :select, :collection => ['player', 'user', 'organization', 'host', 'admin'],:include_blank => false
    end
    f.actions
  end

  permit_params :song_id, :game_id, :name, :issue, :created_by

end
