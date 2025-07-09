class ConfirmationsController < Devise::ConfirmationsController

	clear_respond_to
	respond_to :json

  def show
   self.resource = resource_class.confirm_by_token(params[:confirmation_token])
	 yield resource if block_given?

   if resource.errors.empty?
		 @confirmation = resource
		 resource.username = resource.username.delete(' ')
		 resource.save!
		 sign_in resource
		 resource.players.update_all(name: resource.name.delete(' ')) if resource.temp_account
     respond_with_navigational(resource){ redirect_to after_confirmation_path_for(resource_name, resource) }
   else
		 @errors = resource.errors
     respond_with_navigational(resource.errors){ render :new }
   end
  end

	def new
	 redirect_to root_path
	end

end
