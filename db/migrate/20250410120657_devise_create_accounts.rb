# frozen_string_literal: true

class DeviseCreateAccounts < ActiveRecord::Migration[7.0]
   def change
    create_table :accounts do |t|
      t.string :name
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.integer :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string :current_sign_in_ip
      t.string :last_sign_in_ip
      t.string :logo_file_name
      t.string :logo_content_type
      t.integer :logo_file_size
      t.datetime :logo_updated_at
      t.integer :credits, default: 0
      t.string :role, default: "player"
      t.string :player_name
      t.string :username, default: ""
      t.string :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string :invitation_token
      t.datetime :invitation_created_at
      t.datetime :invitation_sent_at
      t.datetime :invitation_accepted_at
      t.integer :invitation_limit
      t.references :invited_by, polymorphic: true
      t.integer :invitations_count, default: 0
      t.string :auth_token
      t.datetime :link_created_at
      t.boolean :temp_account, null: false, default: false
      t.string :customer_token
      t.string :last_name
      t.string :phone
      t.string :g_id
      t.integer :games_won, default: 0
      t.integer :songs_won, default: 0
      t.integer :songs_played, default: 0
      t.string :city
      t.string :state
      t.integer :zip_code
      t.integer :picks, default: 0
      t.string :status, default: "unmute"
      t.integer :muted, default: 0
      t.string :best_era
      t.string :best_genre
      t.hstore :user_era, default: {}
      t.hstore :user_genre, default: {}
      t.boolean :intro_redeemed

      t.timestamps
    end

    add_index :accounts, :email, unique: true
    add_index :accounts, :reset_password_token, unique: true
    add_index :accounts, :confirmation_token, unique: true
    add_index :accounts, :invitation_token, unique: true
    add_index :accounts, :invitations_count
  end
end
