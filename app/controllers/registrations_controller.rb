class RegistrationsController < Devise::RegistrationsController

	OTP_EXPIRATION_TIME = 5.minutes.ago

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
      build_resource(sign_up_params)
      resource.skip_confirmation!
      resource.save
      if resource.persisted?
        resource.send_confirmation_instructions
        sign_in(resource_name, resource)
        render json: resource, status: :created
      else
        clean_up_passwords resource
        set_minimum_password_length
        render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'username has already been taken' }, status: 300
    end
  end

	def verify_otp
    @account = Account.find_by_email(params[:email])
    if @account && @account.confirmation_token == params[:otp] && @account.confirmation_sent_at >= OTP_EXPIRATION_TIME
      @account.update(confirmed_at: Time.now, confirmation_token: nil)
      sign_in @account
      render 'api/v1/players/verify_otp', status: :ok
    else
      render json: { error: 'Invalid OTP' }, status: :not_found
    end
  end

  def resend_email_confirmation
    account = Account.find_by_email(params[:email])
    account.send_confirmation_instructions if account
    render json: { success: true }, status: :ok
  end

  def update_email
    if current_account
      current_account.update_columns(email: params[:email], confirmed_at: nil, confirmation_token: nil, confirmation_sent_at: nil)
      current_account.send_confirmation_instructions
      render json: { success: true }, status: :ok
    else
      render json: { error: 'Not logged in' }, status: :unauthorized
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
