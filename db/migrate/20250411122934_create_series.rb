class CreateSeries < ActiveRecord::Migration[7.0]
  def change
    create_table :series do |t|
      t.string :name
      t.text :description
      t.boolean :active, default: false
      t.references :campaign, foreign_key: true

      t.timestamps
    end
  end
end