class OmniauthCallbacksController < ApplicationController
  # OAuth callbacks are browser GET redirects — no CSRF token is present.
  skip_before_action :verify_authenticity_token

  def facebook
    handle_auth
  end

  def twitter
    handle_auth
  end

  def failure
    redirect_to '/login?error=auth_failed'
  end

  private

  def handle_auth
    auth = request.env['omniauth.auth']
    @account = Account.from_omniauth(auth)
    if @account&.persisted?
      sign_in @account
      # Redirect to /login — Login.jsx detects an active session and
      # redirects the user onward to /index automatically.
      redirect_to '/login'
    else
      redirect_to '/login?error=auth_failed'
    end
  rescue StandardError => e
    Rails.logger.error "OmniAuth callback error: #{e.message}"
    redirect_to '/login?error=auth_failed'
  end
end
