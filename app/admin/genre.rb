ActiveAdmin.register Genre do
  menu parent: 'Song Management'

  filter :name

  controller do
    before_action :set_timezone

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "genres"}
    selectable_column
    column :name do |item|
      link_to item.name, [:admin, item]
    end
    column :active do |item|
      item.active ? "Yes" : "No"
    end
    column :created_at
    column :updated_at
    actions
  end

  show do |era|
    attributes_table do
      row :name
      row :active do |item|
        item.active ? "Yes" : "No"
      end
      row :created_at
      row :updated_at
    end

    panel "Songs" do
      table_for resource.songs.each do |song|
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

  permit_params :name, :active
end
