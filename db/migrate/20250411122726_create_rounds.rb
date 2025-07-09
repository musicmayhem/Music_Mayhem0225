class CreateRounds < ActiveRecord::Migration[7.0]
  def change
    create_table :rounds do |t|
      t.references :game
      t.hstore :settings
      t.text :song_order_ids, array: true, default: []
      t.references :session
    end
  end
end