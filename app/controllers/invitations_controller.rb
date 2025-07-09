class InvitationsController < Devise::InvitationsController
  after_action :set_csrf_headers, only: [:create, :destroy]
	clear_respond_to
	respond_to :json

  def edit
    self.resource = resource_class.find_by_invitation_token(params[:invitation_token], true)
    yield resource if block_given?

    if resource.errors.empty?
      resource.update_attributes(username: RandomName.where(alloted: false).sample.fake_name)
      @invitation = resource
      if @invitation.save!
        @invitation.send_confirmation_instructions
        sign_in @invitation
        redirect_to root_url
      end
    else
      @errors = resource.errors
      respond_with_navigational(resource.errors){ render :new }
    end
  end
   def after_accept_path_for
     redirect_to root_url
   end
end
