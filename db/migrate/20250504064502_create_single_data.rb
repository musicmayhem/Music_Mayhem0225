class CreateSingleData < ActiveRecord::Migration[7.2]
  def change
    create_table :single_data, id: :serial do |t|
      t.integer :song_id
      t.text :single_custom_data
      t.datetime :created_at, precision: nil
      t.datetime :updated_at, precision: nil
    end
  end
end
