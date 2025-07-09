class RegistrationsController < Devise::RegistrationsController

	before_action :configure_create_params, if: :devise_controller?
	after_action :set_csrf_headers, only: [:create, :destroy]
	protect_from_forgery :except => [:account_invite]

	clear_respond_to
	respond_to :json

	def update
		update_account_era if params[:account] && params[:account][:user_era]
		update_account_genre if params[:account] && params[:account][:user_genre]
		devise_parameter_sanitizer.permit(:account_update, keys: [:name, :email, :username, :password, :password_confirmation, :logo, :last_name, :phone, :zip_code, :state, :city])
		account_update_params = devise_parameter_sanitizer.sanitize(:account_update)
		@account = current_account
		if @account.update_attributes(account_update_params)
			sign_in(current_account, :bypass => true)
			set_flash_message :notice, :updated
		else
			render json: { errors: resource.errors }, status: 403
		end
	end

	def update_account_era
		current_account.update(user_era: params[:account][:user_era]) if current_account
	end

	def update_account_genre
		current_account.update(user_genre: params[:account][:user_genre]) if current_account
	end

	def create
    a = Account.find_by_username(params[:account][:username]) if params[:account] && params[:account][:username]
		if !a
			super
		else
			render json: { error: 'username has already been taken' }, status: 300
		end
	end

	def resend_confirmation
   if current_account && !current_account.confirmed?
       current_account.send_confirmation_instructions
   end
 end

  def configure_create_params
		devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :email, :username, :password, :password_confirmation])
	end

	def account_invite
		if params[:account]
			arr = params[:account].pluck(:email)
			arr.each do |acc|
				Account.find_by_email(acc) ? '' : Account.invite!(email: acc)
			end
		@response = "Accounts Invited"
		end
	end

	protected
	 def set_csrf_headers
	   if request.format.json?
	     response.headers['csrf-param'] = request_forgery_protection_token
	     response.headers['csrf-token'] = form_authenticity_token
	   end
	 end

end
