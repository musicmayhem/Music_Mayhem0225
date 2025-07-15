# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2025_07_14_074558) do
  create_schema "heroku_ext"

  # These are extensions that must be enabled in order to support this database
  enable_extension "hstore"
  enable_extension "plpgsql"

  create_table "accounts", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "email", limit: 255, default: "", null: false
    t.string "encrypted_password", limit: 255, default: "", null: false
    t.string "reset_password_token", limit: 255
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at", precision: nil
    t.datetime "last_sign_in_at", precision: nil
    t.string "current_sign_in_ip", limit: 255
    t.string "last_sign_in_ip", limit: 255
    t.string "logo_file_name", limit: 255
    t.string "logo_content_type", limit: 255
    t.integer "logo_file_size"
    t.datetime "logo_updated_at", precision: nil
    t.integer "credits", default: 0
    t.string "role", limit: 255, default: "player"
    t.string "player_name", limit: 255
    t.string "username", limit: 255, default: ""
    t.string "confirmation_token", limit: 255
    t.datetime "confirmed_at", precision: nil
    t.datetime "confirmation_sent_at", precision: nil
    t.string "invitation_token", limit: 255
    t.datetime "invitation_created_at", precision: nil
    t.datetime "invitation_sent_at", precision: nil
    t.datetime "invitation_accepted_at", precision: nil
    t.integer "invitation_limit"
    t.integer "invited_by_id"
    t.string "invited_by_type", limit: 255
    t.integer "invitations_count", default: 0
    t.string "auth_token", limit: 255
    t.datetime "link_created_at", precision: nil
    t.boolean "temp_account", default: false, null: false
    t.string "customer_token", limit: 255
    t.string "last_name", limit: 255
    t.string "phone", limit: 255
    t.string "g_id", limit: 255
    t.integer "games_won", default: 0
    t.integer "songs_won", default: 0
    t.integer "songs_played", default: 0
    t.string "city"
    t.string "state"
    t.integer "zip_code"
    t.integer "picks", default: 0
    t.string "status", default: "unmute"
    t.integer "muted", default: 0
    t.string "best_era"
    t.string "best_genre"
    t.hstore "user_era", default: {}
    t.hstore "user_genre", default: {}
    t.boolean "intro_redeemed"
    t.index ["confirmation_token"], name: "index_accounts_on_confirmation_token", unique: true
    t.index ["email"], name: "index_accounts_on_email", unique: true
    t.index ["invitation_token"], name: "index_accounts_on_invitation_token", unique: true
    t.index ["invitations_count"], name: "index_accounts_on_invitations_count"
    t.index ["invited_by_id"], name: "index_accounts_on_invited_by_id"
    t.index ["reset_password_token"], name: "index_accounts_on_reset_password_token", unique: true
  end

  create_table "active_admin_comments", id: :serial, force: :cascade do |t|
    t.string "namespace", limit: 255
    t.text "body"
    t.string "resource_id", limit: 255, null: false
    t.string "resource_type", limit: 255, null: false
    t.integer "author_id"
    t.string "author_type", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author_type_and_author_id"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource_type_and_resource_id"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", id: :serial, force: :cascade do |t|
    t.string "email", limit: 255, default: "", null: false
    t.string "encrypted_password", limit: 255, default: "", null: false
    t.string "reset_password_token", limit: 255
    t.datetime "reset_password_sent_at", precision: nil
    t.datetime "remember_created_at", precision: nil
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at", precision: nil
    t.datetime "last_sign_in_at", precision: nil
    t.string "current_sign_in_ip", limit: 255
    t.string "last_sign_in_ip", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "dropbox_access_token", limit: 255
    t.string "dropbox_secret_token", limit: 255
    t.text "cursor"
    t.datetime "dropbox_synced_at", precision: nil
    t.boolean "enabled_stripe_test", default: false
    t.string "bearer_token", limit: 255
    t.string "video_cursor"
    t.datetime "video_sync_time", precision: nil
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "assets", id: :serial, force: :cascade do |t|
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "adv_image_file_name", limit: 255
    t.string "adv_image_content_type", limit: 255
    t.integer "adv_image_file_size"
    t.datetime "adv_image_updated_at", precision: nil
    t.integer "campaign_id"
    t.string "iframe_url"
    t.boolean "display_banner"
    t.string "name"
    t.boolean "show_on_start", default: false
    t.boolean "show_during_game", default: false
    t.boolean "trivia_asset", default: false
    t.index ["campaign_id"], name: "index_assets_on_campaign_id"
  end

  create_table "campaign_assets", force: :cascade do |t|
    t.integer "campaign_id"
    t.integer "asset_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
  end

  create_table "campaigns", id: :serial, force: :cascade do |t|
    t.string "title", limit: 255
    t.text "description"
    t.integer "duration"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.boolean "show_on_start", default: false
    t.boolean "show_between_songs", default: false
    t.integer "player_limit", default: 25
    t.boolean "jukebox"
    t.integer "song_count"
    t.boolean "background_music"
    t.integer "timer"
    t.integer "profile_id"
    t.integer "playlist_id"
    t.boolean "player_pick_playlist"
  end

  create_table "challenges", id: :serial, force: :cascade do |t|
    t.integer "template_game_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "charges", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255
    t.string "email", limit: 255
    t.decimal "amount"
    t.string "currency", limit: 255
    t.string "stripe_id", limit: 255
    t.string "description", limit: 255
    t.string "brand", limit: 255
    t.string "country", limit: 255
    t.string "customer", limit: 255
    t.string "exp_month", limit: 255
    t.string "exp_year", limit: 255
    t.string "funding", limit: 255
    t.string "last4", limit: 255
    t.string "status", limit: 255
    t.decimal "credited_at"
    t.integer "account_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.datetime "expiring_at", precision: nil
  end

  create_table "double_data", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.string "double_custom_data1", limit: 255
    t.string "double_custom_data2", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "era_songs", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.integer "era_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "eras", id: :serial, force: :cascade do |t|
    t.integer "begin_year"
    t.integer "end_year"
    t.string "name", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.boolean "active", default: true
  end

  create_table "feedbacks", id: :serial, force: :cascade do |t|
    t.boolean "did_you_have_fun"
    t.boolean "did_everything_work"
    t.boolean "contact_me"
    t.boolean "any_suggestions_or_ideas"
    t.string "comments", limit: 255
    t.integer "account_id"
    t.integer "player_id"
    t.integer "game_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "game_constraints", id: :serial, force: :cascade do |t|
    t.integer "game_id"
    t.integer "constraint_id"
    t.string "constraint_type", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "game_profiles", force: :cascade do |t|
    t.string "name"
    t.boolean "background_music"
    t.integer "song_count"
    t.integer "point_value"
    t.integer "guess_timer"
    t.integer "song_play_time"
    t.boolean "automatic_song_advance", default: false
    t.integer "leaderboard_display_time"
    t.integer "game_over_display_time"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "playlist_id"
    t.string "splash_url"
    t.integer "splash_duration"
    t.boolean "enable_splash", default: false
    t.boolean "round_starting_audio", default: true
    t.boolean "show_title_hint", default: true
    t.boolean "show_artist_hint", default: true
    t.float "scoreboard_duration", default: 1.0
    t.boolean "show_year_hint", default: false
    t.boolean "game_code_display", default: true
    t.boolean "round_leaderboard", default: true
    t.boolean "game_over_leaderboard", default: true
  end

  create_table "games", id: :serial, force: :cascade do |t|
    t.string "name", limit: 60
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "current_song_id"
    t.integer "account_id"
    t.string "code", limit: 255
    t.string "state", limit: 255
    t.integer "current_round_id"
    t.integer "loaded_song_id"
    t.string "reward", limit: 255
    t.boolean "passive_mode", default: false
    t.integer "contestants"
    t.boolean "skip_video"
    t.boolean "manual_control", default: false
    t.string "game_mode", limit: 255
    t.boolean "random_play", default: true
    t.text "prev_games_ids", default: "--- []\r\n"
    t.integer "challenge_id"
    t.boolean "review_song", default: false
    t.integer "campaign_id"
    t.boolean "jukebox_mode"
    t.boolean "game_completed", default: false
    t.boolean "background_music"
    t.boolean "open_session", default: false
    t.float "timer", default: 0.0
    t.boolean "automatic_song_advance", default: false
    t.integer "session_id"
    t.integer "reset_round"
    t.boolean "playlist_pick_redeemed", default: false
    t.boolean "players_pick_redeemed", default: false
    t.integer "pick_account"
    t.integer "playlist_pick_round_id"
    t.boolean "automatic_round_advance", default: false
    t.integer "remote_host_id"
    t.string "trivia_url"
    t.integer "question_number", default: 1
    t.integer "player_limit", default: 25
    t.integer "profile_id"
    t.string "winner_spiff"
    t.boolean "mirror_active", default: false
    t.boolean "show_title_hint", default: true
    t.boolean "show_artist_hint", default: true
    t.text "mayhem_mates_words", default: [], array: true
    t.boolean "show_scoreboard", default: false
    t.boolean "show_year_hint", default: false
    t.boolean "game_code_display", default: true
    t.boolean "round_leaderboard", default: true
    t.boolean "game_over_leaderboard", default: true
  end

  create_table "genre_songs", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.integer "genre_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["genre_id"], name: "index_genre_songs_on_genre_id"
    t.index ["song_id"], name: "index_genre_songs_on_song_id"
  end

  create_table "genres", id: :serial, force: :cascade do |t|
    t.string "name", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "songs_count", default: 0
    t.boolean "active", default: true
  end

  create_table "guesses", id: :serial, force: :cascade do |t|
    t.integer "song_play_id"
    t.integer "player_id"
    t.integer "artist_score", default: 0
    t.integer "title_score", default: 0
    t.string "artist", limit: 255
    t.string "title", limit: 255
    t.integer "round_id"
    t.integer "account_id"
    t.integer "additional_points", default: 0
    t.float "seconds_title_answer"
    t.float "seconds_artist_answer"
    t.integer "year_score", default: 0
    t.float "seconds_year_answer"
    t.string "year", limit: 255
    t.index ["player_id"], name: "index_guesses_on_player_id"
    t.index ["song_play_id"], name: "index_guesses_on_song_play_id"
  end

  create_table "last_game_codes", id: :serial, force: :cascade do |t|
    t.string "code", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "logged_in_devices", id: :serial, force: :cascade do |t|
    t.string "browser_name", limit: 255
    t.string "browser_version", limit: 255
    t.string "os_name", limit: 255
    t.string "os_full_version", limit: 255
    t.string "device_name", limit: 255
    t.string "device_type", limit: 255
    t.string "ip", limit: 255
    t.string "city", limit: 255
    t.string "country", limit: 255
    t.integer "account_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "nexmo_numbers", id: :serial, force: :cascade do |t|
    t.string "number", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "open_sessions", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.integer "series_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "active", default: false
    t.integer "last_ticket", default: 100
  end

  create_table "player_answers", force: :cascade do |t|
    t.integer "player_id"
    t.integer "game_id"
    t.string "answer"
    t.string "p_name"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "round_id"
    t.integer "question_number"
  end

  create_table "player_song_plays", force: :cascade do |t|
    t.integer "player_id"
    t.integer "song_id"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "account_id"
  end

  create_table "players", id: :serial, force: :cascade do |t|
    t.integer "game_id"
    t.string "name", limit: 255
    t.string "email", limit: 255
    t.integer "account_id"
    t.integer "additional_points", default: 0
    t.hstore "additional_round_points", default: {}
    t.string "mayhem_mates_word"
  end

  create_table "playlist_songs", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.integer "playlist_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "position"
  end

  create_table "playlists", id: :serial, force: :cascade do |t|
    t.string "name", limit: 60
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.integer "account_id"
    t.string "access", limit: 255, default: "private"
    t.text "eras", default: [], array: true
    t.text "genres", default: [], array: true
  end

  create_table "question_answer_data", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.string "question", limit: 255
    t.string "answer", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "random_names", id: :serial, force: :cascade do |t|
    t.string "fake_name", limit: 255, null: false
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.boolean "alloted", default: false
  end

  create_table "referrals", id: :serial, force: :cascade do |t|
    t.integer "amount"
    t.integer "voucher_id"
    t.integer "account_id"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "rounds", id: :serial, force: :cascade do |t|
    t.integer "game_id"
    t.hstore "settings"
    t.text "song_order_ids", default: [], array: true
    t.integer "session_id"
  end

  create_table "score_tables", force: :cascade do |t|
    t.integer "rank"
    t.string "p_name"
    t.integer "score"
    t.string "p_email"
    t.integer "series_id"
  end

  create_table "series", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.boolean "active", default: false
    t.bigint "campaign_id"
    t.index ["campaign_id"], name: "index_series_on_campaign_id"
  end

  create_table "sessions", id: :serial, force: :cascade do |t|
    t.string "session_id", limit: 255, null: false
    t.text "data"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["session_id"], name: "index_sessions_on_session_id", unique: true
    t.index ["updated_at"], name: "index_sessions_on_updated_at"
  end

  create_table "single_data", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.text "single_custom_data"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  create_table "song_feedbacks", id: :serial, force: :cascade do |t|
    t.integer "song_id"
    t.integer "game_id"
    t.string "name", limit: 255
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "issue"
    t.string "created_by"
    t.index ["game_id"], name: "index_song_feedbacks_on_game_id"
    t.index ["song_id"], name: "index_song_feedbacks_on_song_id"
  end

  create_table "song_plays", id: :serial, force: :cascade do |t|
    t.integer "game_id"
    t.integer "song_id"
    t.datetime "started_at", precision: nil
    t.datetime "ended_at", precision: nil
    t.integer "time_offset", default: 0
    t.datetime "paused_at", precision: nil
    t.boolean "skip_song", default: false
    t.boolean "data_fetched", default: false
    t.integer "round_id"
  end

  create_table "songs", id: :serial, force: :cascade do |t|
    t.string "title", limit: 255
    t.string "artist", limit: 255
    t.string "length_in_seconds", limit: 255
    t.integer "year"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.string "path", limit: 255
    t.text "direct_url"
    t.datetime "direct_url_expires_at", precision: nil
    t.integer "play_count", default: 0
    t.string "itunes_affiliate_url", limit: 255
    t.string "itunes_artwork_url", limit: 255
    t.boolean "active", default: true
    t.string "before_archive_path", limit: 255
    t.text "public_url"
    t.string "question_type", default: "song"
    t.index ["path"], name: "index_songs_on_path"
  end

  create_table "spiffs", force: :cascade do |t|
    t.string "name"
    t.bigint "account_id"
    t.string "awarded_at"
    t.string "redeemed_at"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["account_id"], name: "index_spiffs_on_account_id"
  end

  create_table "subscriptions", id: :serial, force: :cascade do |t|
    t.integer "account_id"
    t.text "plan_id"
    t.text "customer_token"
    t.text "subscription_id"
    t.integer "amount"
    t.string "status", limit: 255
    t.string "interval", limit: 255
    t.datetime "cancelled_at", precision: nil
    t.datetime "current_period_start", precision: nil
    t.datetime "current_period_end", precision: nil
    t.string "plan_name", limit: 255
    t.text "new_membership_type"
    t.integer "new_plan_amount"
    t.string "new_plan_name", limit: 255
    t.datetime "new_plan_activation_date", precision: nil
    t.datetime "new_plan_expiry_date", precision: nil
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
    t.index ["account_id"], name: "index_subscriptions_on_account_id"
  end

  create_table "tickets", force: :cascade do |t|
    t.integer "series_id"
    t.integer "account_id"
    t.boolean "redeemed", default: false
    t.boolean "winner", default: false
    t.integer "number"
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "session_id"
  end

  create_table "videos", force: :cascade do |t|
    t.string "title"
    t.string "url"
    t.string "state"
    t.boolean "is_private"
    t.datetime "schedule", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.string "stream_name"
    t.string "thumb_file_name"
    t.string "thumb_content_type"
    t.integer "thumb_file_size"
    t.datetime "thumb_updated_at", precision: nil
    t.boolean "is_featured", default: false
    t.string "description"
    t.string "path"
  end

  create_table "vouchers", id: :serial, force: :cascade do |t|
    t.string "code", limit: 255
    t.integer "amount"
    t.integer "account_id"
    t.string "access", limit: 255
    t.boolean "active"
    t.datetime "created_at", precision: nil
    t.datetime "updated_at", precision: nil
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "series", "campaigns"
end
