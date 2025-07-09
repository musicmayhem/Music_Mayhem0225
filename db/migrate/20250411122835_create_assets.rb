class CreateAssets < ActiveRecord::Migration[7.0]
  def change
    create_table :assets do |t|
      t.string :adv_image_file_name
      t.string :adv_image_content_type
      t.integer :adv_image_file_size
      t.datetime :adv_image_updated_at
      t.references :campaign
      t.string :iframe_url
      t.boolean :display_banner
      t.string :name
      t.boolean :show_on_start, default: false
      t.boolean :show_during_game, default: false
      t.boolean :trivia_asset, default: false

      t.timestamps
    end
  end
end