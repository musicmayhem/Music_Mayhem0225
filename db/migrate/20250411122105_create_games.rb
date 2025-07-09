class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.string :name, limit: 60
      t.references :current_song, foreign_key: { to_table: :songs }
      t.references :account, foreign_key: true
      t.string :code
      t.string :state
      t.references :current_round
      t.references :loaded_song, foreign_key: { to_table: :songs }
      t.string :reward
      t.boolean :passive_mode, default: false
      t.integer :contestants
      t.boolean :skip_video
      t.boolean :manual_control, default: false
      t.string :game_mode
      t.boolean :random_play, default: true
      t.text :prev_games_ids, default: [].to_yaml
      t.references :challenge
      t.boolean :review_song, default: false
      t.references :campaign
      t.boolean :jukebox_mode
      t.boolean :game_completed, default: false
      t.boolean :background_music
      t.boolean :open_session, default: false
      t.float :timer, default: 0.0
      t.boolean :automatic_song_advance, default: false
      t.references :session
      t.integer :reset_round
      t.boolean :playlist_pick_redeemed, default: false
      t.boolean :players_pick_redeemed, default: false
      t.integer :pick_account
      t.integer :playlist_pick_round_id
      t.boolean :automatic_round_advance, default: false
      t.integer :remote_host_id
      t.string :trivia_url
      t.integer :question_number, default: 1
      t.integer :player_limit, default: 25
      t.references :profile
      t.string :winner_spiff
      t.boolean :mirror_active, default: false
      t.boolean :show_title_hint, default: true
      t.boolean :show_artist_hint, default: true
      t.text :mayhem_mates_words, array: true, default: []
      t.boolean :show_scoreboard, default: false
      t.boolean :show_year_hint, default: false
      t.boolean :game_code_display, default: true
      t.boolean :round_leaderboard, default: true
      t.boolean :game_over_leaderboard, default: true

      t.timestamps
    end
  end
end