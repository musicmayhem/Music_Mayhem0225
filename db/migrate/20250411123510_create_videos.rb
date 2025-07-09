class CreateVideos < ActiveRecord::Migration[7.0]
  def change
    create_table :videos do |t|
      t.string :title
      t.string :url
      t.string :state
      t.boolean :is_private
      t.datetime :schedule
      t.string :stream_name
      t.string :thumb_file_name
      t.string :thumb_content_type
      t.integer :thumb_file_size
      t.datetime :thumb_updated_at
      t.boolean :is_featured, default: false
      t.string :description
      t.string :path

      t.timestamps
    end
  end
end