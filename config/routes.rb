Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)
  # devise_for :accounts
  devise_for :accounts, defaults: { format: :json }, controllers: { registrations: "registrations", sessions: "sessions", passwords: "passwords",confirmations: "confirmations", invitations: "invitations"}

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  root 'homepage#index'
  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do

      resource :games, only: [] do
        get :game_codeplayers, :demo, :game_history, :get_open_session_list,
            :generate_playlist, :account_setting, :get_series_games, :career_data,
            :get_open_series_list, :get_game_profiles, :authenticate_users,
            :get_index_data, :get_trivia_assets

        post :get_api_authentication_token, :add_new_round, :update_state,
             :current_round, :song_loaded, :active_song, :get_game_data, :solo,
             :start_new_game, :check_game_code, :game_configurations_update,
             :get_leaderboard_data, :close_open_session, :close_open_series,
             :get_series_detail, :get_remote_data, :game_volume_request,
             :skip_and_add_song_current_game, :advance_song_in_game, :launch_appliance,
             :reset_round_score, :player_answers, :reset_game, :game_players,
             :player_playlist, :gifting_component, :pusher_update, :current_points,
             :game_leaderboard, :skip_song_data, :add_feedback, :redeem_index_spiff,
             :active_camp_session,:update_spiff, :get_song_data, :get_songs, :update_setting,
             :get_series_summary, :update_appliance, :trivia_ticket_score, :get_filtered_song_count, :match_mates,
             :mayhem_spinner_update, :send_message

        patch :update_game_after_request
      end

      resources :rounds do
        resources :songs, only: :index
      end
      resource :mirror do
        post :mirror_data, :game_over_data
      end

      resource :player do
        get :players_game, :get_random_name, :series_score, :songs_played
        post :rewards, :send_email_to_players, :check_player_present, :find_scores, :check_player_present_in_last_game,
             :get_demo_data, :resend_email_confirmation, :send_host_answer, :set_playlist, :host_playlists, :redeem_ticket,
             :winner_ticket, :tickets, :send_rewards, :redeem_pick, :unmute_player,:redeem_spiff,:gift_tickets,
             :total_score, :check_player_name, :update_players_picks, :verify_otp
      end

      resource :pages do
        get :shared
        post :feedback
      end

      resources :guestusers
      resources :guesses
      resources :games
      resources :players
      resources :videos
    end
  end

  post '/admin/download_song_data' => 'download#download_song_data', as: :admin_download_song_data
  post '/admin/upload_csv' => 'download#upload_csv'
  post '/admin/upload_playlist_csv' => 'download#upload_playlist_csv'
  post '/admin/player_guess_history' => 'download#player_guess_history', as: :admin_player_guess_history
  post '/admin/all_player_guess_history' => 'download#all_player_guess_history', as: :admin_all_player_guess_history
  post '/admin/all_player_trivia_answers' => 'download#all_player_trivia_answers', as: :admin_all_player_trivia_answers
  post '/admin/download_songs_in_playlist' => 'download#download_songs_in_playlist', as: :admin_download_songs_in_playlist
  post '/admin/download_playlist_song_data' => 'download#download_playlist_song_data', as: :admin_download_playlist_song_data
  get 'admin/songs/:id/get_expanded_data' => 'api/v1/songs#get_expanded_data'
  post '/admin/songs/:id/update_song_custom_data' => 'api/v1/songs#admin_update_song_custom_data', as: :admin_update_song_custom_data
  patch '/admin/songs/:id/update_song' => 'api/v1/songs#admin_update_song', as: :admin_update_song
  get '/dropboxauthorize' => 'dropbox#authorize', :as => :dropbox_auth
  get '/dropbox/auth_callback' => 'dropbox#callback', :as => :dropbox_callback
  get '/admin/videos/:id/start' => 'api/v1/videos#play', as: :admin_video_play
  get '/admin/videos/:id/end' => 'api/v1/videos#end', as: :admin_video_end
  get '/admin/videos/:id/delete_image' => 'api/v1/videos#destroy_image', as: :admin_video_image_delete
  patch '/admin/stripe_sandbox_switch' => 'charges#stripe_sandbox_switch', as: :admin_stripe_sandbox_switch
  get '*path', to: 'homepage#index'
  post '*path', to: 'homepage#index'
  post '/', to: 'homepage#index'
  match '*path', to: 'homepage#index', via: :options
  match '/', to: 'homepage#index', via: :options

end
