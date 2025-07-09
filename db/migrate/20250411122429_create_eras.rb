class CreateEras < ActiveRecord::Migration[7.0]
  def change
    create_table :eras do |t|
      t.integer :begin_year
      t.integer :end_year
      t.string :name
      t.boolean :active, default: true

      t.timestamps
    end
  end
end