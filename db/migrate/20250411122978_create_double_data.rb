class CreateDoubleData < ActiveRecord::Migration[7.0]
  def change
    create_table :double_data do |t|
      t.integer :song_id
      t.string :double_custom_data1
      t.string :double_custom_data2
      t.timestamps
    end
  end
end
