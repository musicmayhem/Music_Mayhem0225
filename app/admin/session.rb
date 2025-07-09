ActiveAdmin.register OpenSession do
  config.per_page = [20, 50, 100]
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
        OpenSession.find(params[:id])
      end
    end

    def create
      params[:open_session][:name] = params[:open_session][:name].parameterize
      super
    end

    def update
      super
      Game.where(id: params[:open_session][:game_ids]).update_all(session_id: resource.id)
    end

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end

    def create_mongo_record
      MongoSession.create(session_id: resource.id, session_name: resource.name, series_id: resource.series_id, action: params['action'] == 'destroy' ? 'delete' : params['action'] == 'update' ?  'edit' : params['action'], actor: current_admin_user&.email, account_id: current_admin_user&.id )
    end

  end

  member_action :remove_game, method: :delete do
    @game = Game.find_by_session_id(resource.id)
    @game.update(session_id: nil)
    respond_to do |format|
      format.js { render 'admin/open_session/remove_game' }
      format.html { redirect_to admin_open_session_path(resource) }
    end
  end

  batch_action :active do |selection|
    selected_sessions = OpenSession.where(id: selection)
    selected_sessions.update_all(active: true)
    selected_sessions.map { |session|  MongoSession.create(session_id: session.id, session_name: session.name, series_id: session.series_id, action: 'enable', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Session set to Active" }
  end

  batch_action :inactive do |selection|
    selected_sessions = OpenSession.where(id: selection)
    selected_sessions.update_all(active: false)
    selected_sessions.map { |session|  MongoSession.create(session_id: session.id, session_name: session.name, series_id: session.series_id, action: 'disable', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Session set to Inactive" }
  end

  batch_action :destroy do |selection|
    selected_sessions = OpenSession.where(id: selection)
    selected_sessions.map { |session|  MongoSession.create(session_id: session.id, session_name: session.name, series_id: session.series_id, action: 'delete', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    selected_sessions.destroy_all
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Sessions are Deleted" }
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
    actions
  end

  form do |f|
    f.inputs do
      f.input :games, as: :check_boxes, input_html: { multiple: true }, label: 'Select Game',  collection: Game.no_session_game.map {|u| [u.code, u.id]}
      f.input :name
      f.input :description
      f.input :active
    end
    f.actions
  end

  show do |open_session|
    attributes_table do
      row :id
      row :name
      row :description
      row :created_at
      row :updated_at
      row :active
      row :games do |se|
        if Game.exists?(session_id: se.id)
          link_to OpenSession.find(params[:id]).games.pluck(:code), admin_game_path(Game.find_by_session_id(se.id).code)
        end
      end
      row :related_series do |se|
       if Series.exists?(id: se.series_id)
         link_to Series.find(se.series_id).name, admin_series_path(se.series_id)
       end
     end
     panel "Games" do
       paginated_collection(resource.games.page(params[:page]).per(20)) do
         table_for collection.each do |game|
           column :code do |game|
             link_to game.code, [:admin, game]
           end

           column :actions do |game|
            link_to 'Remove',  remove_game_admin_open_session_path(resource, :game_id => game.id), method: :delete, data: {confirm: 'Remove game from session?'}
          end
         end
        end
      end
    end
  end
  permit_params :name, :description, :active
end
