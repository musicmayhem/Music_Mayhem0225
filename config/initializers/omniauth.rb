OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_KEY'], ENV['GOOGLE_SECRET_KEY'], {client_options: {ssl: {ca_file: Rails.root.join("cacert.pem").to_s}}}
  # provider :instagram, ENV['INSTA_KEY'], ENV['INSTA_SECRET_KEY'], scope: 'basic comments public_content'
  provider :facebook, ENV['FB_KEY'], ENV['FB_SECRET_KEY']
  # provider :pinterest, ENV['PIN_KEY'], ENV['PIN_SECRET_KEY']
  provider :twitter, ENV['TWITTER_KEY'], ENV['TWITTER_SECRET_KEY']
end