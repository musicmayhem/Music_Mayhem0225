class CreateCharges < ActiveRecord::Migration[7.0]
  def change
    create_table :charges do |t|
      t.string :name
      t.string :email
      t.decimal :amount
      t.string :currency
      t.string :stripe_id
      t.string :description
      t.string :brand
      t.string :country
      t.string :customer
      t.string :exp_month
      t.string :exp_year
      t.string :funding
      t.string :last4
      t.string :status
      t.decimal :credited_at
      t.references :account
      t.datetime :expiring_at

      t.timestamps
    end
  end
end