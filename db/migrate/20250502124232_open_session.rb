class OpenSession < ActiveRecord::Migration[7.2]
  def change
    create_table :open_sessions do |t|
      t.string :name
      t.text :description
      t.integer :series_id
      t.datetime :created_at, null: false
      t.datetime :updated_at, null: false
      t.boolean :active, default: false
      t.integer :last_ticket, default: 100
    end
  end
end
