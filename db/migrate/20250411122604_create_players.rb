class CreatePlayers < ActiveRecord::Migration[7.0]
  def change
    create_table :players do |t|
      t.references :game
      t.string :name
      t.string :email
      t.references :account
      t.integer :additional_points, default: 0
      t.hstore :additional_round_points, default: {}
      t.string :mayhem_mates_word
    end
  end
end