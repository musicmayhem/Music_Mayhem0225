class CreateGenres < ActiveRecord::Migration[7.0]
  def change
    create_table :genres do |t|
      t.string :name
      t.integer :songs_count, default: 0
      t.boolean :active, default: true

      t.timestamps
    end
  end
end