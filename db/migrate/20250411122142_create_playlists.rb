class CreatePlaylists < ActiveRecord::Migration[7.0]
  def change
    create_table :playlists do |t|
      t.string :name, limit: 60
      t.references :account
      t.string :access, default: "private"
      t.text :eras, array: true, default: []
      t.text :genres, array: true, default: []

      t.timestamps
    end
  end
end