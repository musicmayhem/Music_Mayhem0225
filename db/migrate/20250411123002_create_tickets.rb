class CreateTickets < ActiveRecord::Migration[7.0]
  def change
    create_table :tickets do |t|
      t.references :series
      t.references :account
      t.boolean :redeemed, default: false
      t.boolean :winner, default: false
      t.integer :number
      t.references :session

      t.timestamps
    end
  end
end