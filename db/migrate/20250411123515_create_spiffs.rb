class CreateSpiffs < ActiveRecord::Migration[7.0]
  def change
    create_table :spiffs do |t|
      t.string :name
      t.references :account
      t.string :awarded_at
      t.string :redeemed_at

      t.timestamps
    end
  end
end