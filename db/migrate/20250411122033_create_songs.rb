class CreateSongs < ActiveRecord::Migration[7.0]
  def change
    create_table :songs do |t|
      t.string :title
      t.string :artist
      t.string :length_in_seconds
      t.integer :year
      t.string :path
      t.text :direct_url
      t.datetime :direct_url_expires_at
      t.integer :play_count, default: 0
      t.string :itunes_affiliate_url
      t.string :itunes_artwork_url
      t.boolean :active, default: true
      t.string :before_archive_path
      t.text :public_url

      t.timestamps
    end

    add_index :songs, :path
  end
end