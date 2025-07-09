class DropboxController < ApplicationController
  before_action :authenticate_admin_user!

  def authorize
    authenticator = DropboxApi::Authenticator.new(current_admin_user.dropbox_access_token, current_admin_user.dropbox_secret_token)
    url = authenticator.authorize_url :redirect_uri => redirect_uri
    redirect_to url
  end

  def redirect_uri
    "https://#{request.host_with_port}/dropbox/auth_callback"
  end

  def callback
    authenticator = DropboxApi::Authenticator.new(current_admin_user.dropbox_access_token, current_admin_user.dropbox_secret_token)
    auth_bearer = authenticator.get_token(params[:code], :redirect_uri => redirect_uri)
    token = auth_bearer.token
    current_admin_user.link_to_dropbox_with_access_token(token)
    current_admin_user.dropbox_sync!
    redirect_to admin_admin_user_path(current_admin_user)
  end
end
