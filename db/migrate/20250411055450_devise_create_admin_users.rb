# frozen_string_literal: true

class DeviseCreateAdminUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :admin_users, id: :serial do |t|
      t.string :email, limit: 255, default: "", null: false
      t.string :encrypted_password, limit: 255, default: "", null: false
      t.string :reset_password_token, limit: 255
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.integer :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string :current_sign_in_ip, limit: 255
      t.string :last_sign_in_ip, limit: 255
      t.datetime :created_at, precision: nil
      t.datetime :updated_at, precision: nil
      t.string :dropbox_access_token, limit: 255
      t.string :dropbox_secret_token, limit: 255
      t.text :cursor
      t.datetime :dropbox_synced_at
      t.boolean :enabled_stripe_test, default: false
      t.string :bearer_token, limit: 255
      t.string :video_cursor
      t.datetime :video_sync_time

      # t.timestamps is omitted because created_at and updated_at are explicitly added above
    end

    add_index :admin_users, :email, unique: true
    add_index :admin_users, :reset_password_token, unique: true
  end
end
