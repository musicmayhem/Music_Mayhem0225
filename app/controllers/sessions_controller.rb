class SessionsController < Devise::SessionsController
	after_action :set_csrf_headers, only: [:create, :destroy]
	clear_respond_to
	respond_to :json

	def social_login
	    @account = Account.from_omniauth(request.env["omniauth.auth"])
	    sign_in @account
	    redirect_to '/login'
	end

	protected
	 def set_csrf_headers
	   if request.format.json?
	     response.headers['csrf-param'] = request_forgery_protection_token
	     response.headers['csrf-token'] = form_authenticity_token
	   end
	 end
end
