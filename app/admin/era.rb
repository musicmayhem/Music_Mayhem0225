ActiveAdmin.register Era do
  menu parent: 'Song Management'

  controller do
    before_action :set_timezone

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "eras"}
    selectable_column
    column :name do |item|
      link_to item.name, [:admin, item]
    end
    column :begin_year
    column :end_year
    column :active do |era|
      era.active ? "Yes" : "No"
    end
    actions
  end

  show do |era|
    attributes_table do
      row :name
      row :begin_year
      row :end_year
      row :active do |item|
        item.active ? "Yes" : "No"
      end
      row :created_at
      row :updated_at
    end

    panel "Songs" do
      paginated_collection(resource.songs.page(params[:page]).per(50)) do
	      table_for collection.each do |song|
	        column :title do |song|
	          link_to song.title, [:admin, song]
	        end
	        column :artist
	        column :length_in_seconds
	        column :year
	        column :genres do |song|
	          song.genres.collect{ |g| link_to g.name, [:admin, g] }.join(', ').html_safe
	        end
	      end
	   end
    end
  end

  permit_params :name, :begin_year, :end_year, :active
end
