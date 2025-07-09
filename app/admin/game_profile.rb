ActiveAdmin.register GameProfile do
  menu parent: 'Game Management'

  filter :name
  filter :background_music
  filter :automatic_song_advance

  permit_params :song_count,:name,:background_music,:song_count,:playlist_id,:point_value,:guess_timer,
                :song_play_time,:automatic_song_advance,:leaderboard_display_time,:game_over_display_time,
                :splash_url,:splash_duration,:enable_splash,:round_starting_audio,:show_title_hint,:show_artist_hint,
                :scoreboard_duration,:game_code_display,:round_leaderboard,:game_over_leaderboard

  show do |game_profile|
    attributes_table do
      row :id
      row :name
      row :song_count
      row :background_music
      row :point_value
      row :guess_timer
      row :song_play_time
      row :automatic_song_advance
      row :leaderboard_display_time
      row :game_over_display_time
      row :splash_url
      row :splash_duration
      row :enable_splash
      row :round_starting_audio
      row :playlist_id do |game_profile|
          link_to Playlist.find_by_id(game_profile.playlist_id).name, admin_playlist_path(game_profile.playlist_id) if game_profile.playlist_id.present?
      end
      row :show_title_hint
      row :show_artist_hint
      row :game_code_display
      row :round_leaderboard
      row :game_over_leaderboard
    end
  end

  index do
    column :id
    column :name
    column :song_count
    column :background_music
    column :point_value
    column :guess_timer
    column :song_play_time
    column :automatic_song_advance
    column :leaderboard_display_time
    column :game_over_display_time
    column :splash_url
    column :splash_duration
    column :enable_splash
    column :round_starting_audio
    column :playlist_id do |game_profile|
        link_to game_profile.playlist.name, admin_playlist_path(game_profile.playlist_id) if game_profile.playlist
    end
    column :show_title_hint
    column :show_artist_hint
    column :game_code_display
    column :round_leaderboard
    column :game_over_leaderboard
    actions
  end

  form do |f|
    f.inputs "Game Profile Details" do
      f.input :name
      f.input :song_count
      f.input :playlist_id, :label => 'Playlist', :as => :select, :collection => Playlist.all.map {|u| [u.name, u.id]}
      f.input :background_music
      f.input :point_value
      f.input :guess_timer
      f.input :song_play_time
      f.input :automatic_song_advance
      f.input :leaderboard_display_time
      f.input :splash_url
      f.input :splash_duration
      f.input :enable_splash
      f.input :round_starting_audio
      f.input :game_over_display_time
      f.input :scoreboard_duration
      f.input :show_title_hint
      f.input :show_artist_hint
      f.input :game_code_display
      f.input :round_leaderboard
      f.input :game_over_leaderboard
    end
    f.actions
  end

end
