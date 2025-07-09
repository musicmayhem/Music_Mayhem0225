ActiveAdmin.register Series do
  config.per_page = [20, 50, 100]
  # config.sort_order = 'active_desc'
  menu parent: 'Series Management'

  filter :name
  filter :active

  controller do
    before_action :set_timezone
    after_action :create_mongo_record, only: [:create, :destroy, :update]

    def resource
      if action_name == 'new' || action_name == 'create'
        super
      else
        Series.find(params[:id])
      end
    end

    def update
      super
      OpenSession.where(id: params[:series][:open_session_ids]).update_all(series_id: resource.id)
      resource.update(campaign_id: params[:series][:campaign_id])
    end

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end

    def create_mongo_record
      MongoSeries.create(series_id: resource.id, series_name: resource.name, campaign_id: resource.campaign_id, action: params['action'] == 'destroy' ? 'delete' : params['action'] == 'update' ?  'edit' : params['action'], actor: current_admin_user&.email, account_id: current_admin_user&.id)
    end

  end

  member_action :remove_open_session, method: :delete do
    @open_session = OpenSession.find_by_id(params['open_session_id'])
    @open_session.update(series_id: nil)
    respond_to do |format|
      format.js { render 'admin/series/remove_open_session' }
      format.html { redirect_to admin_series_path(resource) }
    end
  end

  batch_action :active do |selection|
    selected_series = Series.where(id: selection)
    selected_series.update_all(active: true)
    selected_series.map { |series|  MongoSeries.create(series_id: series.id, series_name: series.name, campaign_id: series.campaign_id, action: 'enable', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Series set to Active" }
  end

  batch_action :inactive do |selection|
    selected_series = Series.where(id: selection)
    selected_series.update_all(active: false)
    selected_series.map { |series|  MongoSeries.create(series_id: series.id, series_name: series.name, campaign_id: series.campaign_id, action: 'disable', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Series set to Inactive" }
  end

  batch_action :destroy do |selection|
    selected_series = Series.where(id: selection)
    selected_series.map { |series|  MongoSeries.create(series_id: series.id, series_name: series.name, campaign_id: series.campaign_id, action: 'delete', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    selected_series.destroy_all
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Series are Deleted" }
  end

  index do
    selectable_column
    column :id
    column :name do |item|
      link_to item.name, [:admin, item]
    end
    column :description
    column :created_at
    column :updated_at
    column :active
    column :campaign
    actions
  end

  form do |f|
    f.inputs do
      f.input :open_sessions, as: :check_boxes, input_html: { multiple: true }, label: 'Select Session',  collection: OpenSession.no_series_attached.map {|u| [u.name, u.id]}
      f.input :name
      f.input :description
      f.input :active
      f.input :campaign
    end
    f.actions
  end

  show do |series|
    attributes_table do
      row :id
      row :name
      row :description
      row :created_at
      row :updated_at
      row :active
      row :campaign
      row :attached_session do |se|
       if OpenSession.exists?(series_id: se.id)
         link_to OpenSession.find_by_series_id(se.id).name, admin_open_session_path(OpenSession.find_by_series_id(se.id).id)
       end
     end
     panel "OpenSession" do
         paginated_collection(resource.open_sessions.page(params[:page]).per(20)) do
           table_for collection.each do |open_session|
             column :code do |open_session|
               link_to open_session.name, [:admin, open_session]
             end

             column :actions do |open_session|
              link_to 'Remove', remove_open_session_admin_series_path(resource, :open_session_id => open_session.id), method: :delete, data: {confirm: 'Remove session from series?'}
            end
           end
          end
      end
    end
  end
  permit_params :name, :description, :active, :campaign_id, :open_session_ids, :pagination
end
