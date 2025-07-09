class CreateGenreSongs < ActiveRecord::Migration[7.0]
  def change
    create_table :genre_songs do |t|
      t.references :song
      t.references :genre

      t.timestamps
    end
  end
end