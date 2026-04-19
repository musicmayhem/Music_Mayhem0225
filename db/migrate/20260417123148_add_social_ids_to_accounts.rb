class AddSocialIdsToAccounts < ActiveRecord::Migration[7.0]
  def change
    add_column :accounts, :fb_id, :string
    add_column :accounts, :tw_id, :string
    add_index :accounts, :fb_id
    add_index :accounts, :tw_id
  end
end
