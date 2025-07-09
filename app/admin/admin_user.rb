ActiveAdmin.register AdminUser do
  menu parent: 'Account Management'

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "admin_users"}
    column :email
    column :current_sign_in_at
    column :last_sign_in_at
    column :sign_in_count
    actions
  end

  filter :email

  form do |f|
    f.inputs "Admin Details" do
      f.input :email
      f.input :password
      f.input :password_confirmation
    end
    f.actions
  end

  show do |u|
    attributes_table do
      row :email
      row :linked_to_dropbox?
    end
    active_admin_comments
  end

  member_action :sync_dropbox, :method => :post do
    if current_admin_user.dropbox_sync!
      respond_to do |format|
        format.js { render 'admin/admin_users/sync_dropbox' }
      end
    end
  end

  member_action :video_sync, :method => :post do
    if current_admin_user.video_sync!
      respond_to do |format|
        format.js { render 'admin/admin_users/video_sync' }
      end
    end
  end
  permit_params :email, :password, :password_confirmation

end
