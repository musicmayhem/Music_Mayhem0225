class CreateGameProfiles < ActiveRecord::Migration[7.0]
  def change
    create_table :game_profiles do |t|
      t.string :name
      t.boolean :background_music
      t.integer :song_count
      t.integer :point_value
      t.integer :guess_timer
      t.integer :song_play_time
      t.boolean :automatic_song_advance, default: false
      t.integer :leaderboard_display_time
      t.integer :game_over_display_time
      t.references :playlist
      t.string :splash_url
      t.integer :splash_duration
      t.boolean :enable_splash, default: false
      t.boolean :round_starting_audio, default: true
      t.boolean :show_title_hint, default: true
      t.boolean :show_artist_hint, default: true
      t.float :scoreboard_duration, default: 1.0
      t.boolean :show_year_hint, default: false
      t.boolean :game_code_display, default: true
      t.boolean :round_leaderboard, default: true
      t.boolean :game_over_leaderboard, default: true

      t.timestamps
    end
  end
end