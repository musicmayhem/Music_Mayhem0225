class CreatePlaylistSongs < ActiveRecord::Migration[7.0]
  def change
    create_table :playlist_songs do |t|
      t.references :song
      t.references :playlist
      t.integer :position

      t.timestamps
    end
  end
end