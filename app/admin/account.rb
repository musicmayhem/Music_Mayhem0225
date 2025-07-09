ActiveAdmin.register Account do
  # config.per_page = [20, 50, 100]
  menu parent: 'Account Management'

  filter :name
  filter :email
  filter :username
  filter :role
  filter :last_sign_in_at

  controller do
    before_action :set_timezone

    def resource
      if params[:id]
        current_account = Account.find(params[:id])
        @player_song_history = current_account.song_history
      end
      super
    end

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "accounts"}
    column :name
    column :email
    column :username
    column :role
    column :last_sign_in_at
    column :sign_in_count

    actions
  end

  sidebar :Player_History_Data, only: :index do
    button_to('Player History', admin_all_player_guess_history_path(format: 'xls'), disable_with: "Downloading...")
  end

  show do |account|
    attributes_table do
      row :id
      row :name
      row :created_at
      row :updated_at
      row :email
      row :username
      row :role
      row :credits
      row :sign_in_count
      row :current_sign_in_at
      row :last_sign_in_at
      row :current_sign_in_ip
      row :last_sign_in_ip
      row :logo do
        image_tag(account.logo.url(:medium))
      end
      render partial: 'admin/account/score'
    end
  end

  form do |f|
    f.inputs "Account Details" do
      f.input :name
      f.input :email
      f.input :username
      f.input :credits
      f.input :role, :label => 'Role', :as => :select, :collection => ['player', 'user', 'organization', 'host', 'admin'],:include_blank => false
      f.input :logo, :as => :file, :hint => f.template.image_tag(f.object.logo.url(:medium))
    end
    if f.object.new_record?
      f.inputs "Password" do
        f.input :password
        f.input :password_confirmation
      end
    end
    f.actions
  end

  collection_action :current_account, :method => :post do
    @current_playlist = scoped_collection.find(params[:id]) if params[:id]
    session[:current_account] = params[:id]
    respond_to do |format|
      format.js { render 'admin/accounts/set_current_account' }
    end if request.format.js?
  end

  collection_action :destroy_current_account, :method => :delete do
    session[:current_account] = nil
    respond_to do |format|
      format.js { render 'admin/accounts/destroy_current_account' }
    end
  end

  permit_params :name, :email, :username, :logo, :password, :password_confirmation, :credits, :role, :id
end
