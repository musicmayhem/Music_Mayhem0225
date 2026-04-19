OmniAuth.config.logger = Rails.logger

# OmniAuth 2.x changed the default to POST-only for the initiation phase.
# The login buttons use plain <a href> links (GET requests), so we must
# re-enable GET here. silence_get_warning suppresses the console warning.
OmniAuth.config.allowed_request_methods = [:post, :get]
OmniAuth.config.silence_get_warning = true

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
           ENV['GOOGLE_KEY'] || Rails.application.credentials.google_key,
           ENV['GOOGLE_SECRET_KEY'] || Rails.application.credentials.google_secret_key,
           { client_options: { ssl: { ca_file: Rails.root.join("cacert.pem").to_s } } }

  provider :facebook,
           ENV['FB_KEY'] || Rails.application.credentials.fb_key,
           ENV['FB_SECRET_KEY'] || Rails.application.credentials.fb_secret_key,
           { scope: 'email,public_profile', info_fields: 'email,name,picture' }

  provider :twitter,
           ENV['TWITTER_KEY'] || Rails.application.credentials.twitter_key,
           ENV['TWITTER_SECRET_KEY'] || Rails.application.credentials.twitter_secret_key,
           { include_email: true }
end
