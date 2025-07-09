class CreateRandomNames < ActiveRecord::Migration[7.2]
  def change
    create_table :random_names, id: :serial do |t|
      t.string :fake_name, limit: 255, null: false
      t.datetime :created_at, precision: nil
      t.datetime :updated_at, precision: nil
      t.boolean :alloted, default: false
    end
  end
end
