class CreateScoreTables < ActiveRecord::Migration[7.0]
  def change
    create_table :score_tables do |t|
      t.integer :rank
      t.string :p_name
      t.integer :score
      t.string :p_email
      t.references :series
    end
  end
end