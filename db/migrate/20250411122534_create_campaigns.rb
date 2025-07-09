class CreateCampaigns < ActiveRecord::Migration[7.0]
  def change
    create_table :campaigns do |t|
      t.string :title
      t.text :description
      t.integer :duration
      t.boolean :show_on_start, default: false
      t.boolean :show_between_songs, default: false
      t.integer :player_limit, default: 25
      t.boolean :jukebox
      t.integer :song_count
      t.boolean :background_music
      t.integer :timer
      t.references :profile
      t.references :playlist
      t.boolean :player_pick_playlist

      t.timestamps
    end
  end
end