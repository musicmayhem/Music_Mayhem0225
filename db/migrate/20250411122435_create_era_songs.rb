class CreateEraSongs < ActiveRecord::Migration[7.0]
  def change
    create_table :era_songs do |t|
      t.timestamps
    end
  end
end
