class CreateSubscriptions < ActiveRecord::Migration[7.0]
  def change
    create_table :subscriptions do |t|
      t.references :account
      t.text :plan_id
      t.text :customer_token
      t.text :subscription_id
      t.integer :amount
      t.string :status
      t.string :interval
      t.datetime :cancelled_at
      t.datetime :current_period_start
      t.datetime :current_period_end
      t.string :plan_name
      t.text :new_membership_type
      t.integer :new_plan_amount
      t.string :new_plan_name
      t.datetime :new_plan_activation_date
      t.datetime :new_plan_expiry_date

      t.timestamps
    end
  end
end