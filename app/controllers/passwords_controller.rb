class PasswordsController < Devise::PasswordsController

	clear_respond_to
	respond_to :json

	def new
		super
		redirect_to :root
	end

end
