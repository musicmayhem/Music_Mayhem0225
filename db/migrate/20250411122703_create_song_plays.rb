class CreateSongPlays < ActiveRecord::Migration[7.0]
  def change
    create_table :song_plays do |t|
      t.references :game
      t.references :song
      t.datetime :started_at
      t.datetime :ended_at
      t.integer :time_offset, default: 0
      t.datetime :paused_at
      t.boolean :skip_song, default: false
      t.boolean :data_fetched, default: false
      t.references :round
    end
  end
end