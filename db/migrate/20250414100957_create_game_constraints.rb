class CreateGameConstraints < ActiveRecord::Migration[7.0]
  def change
    create_table :game_constraints do |t|
      t.references :game, foreign_key: true
      t.integer :constraint_id
      t.string :constraint_type

      t.timestamps
    end
    add_index :game_constraints, [:constraint_type, :constraint_id]
  end
end
