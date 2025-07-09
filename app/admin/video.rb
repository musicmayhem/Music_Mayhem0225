ActiveAdmin.register Video do
  menu parent: 'Song Management'
  controller do
    before_action :set_timezone
    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end

  index do
    column :id
    column :title
    column :state
    column :schedule
    column :is_private
    column :path
    column :is_featured
    column :created_at
    actions
  end

  show do |video|
    attributes_table do
      row :id
      row :title
      row :state
      row :schedule
      row :is_private
      row :path
      row :is_featured
      row :created_at
      row :thumb do
        video.thumb? ? image_tag(video.thumb.url, height: '100') : content_tag(:span, "No photo yet")
      end
      row :delete_image do
        video.thumb? ? link_to('Delete Image', admin_video_image_delete_path) : content_tag(:span, "No image found")
      end      
    end
  end 

  action_item :start, only: :show do
    link_to 'Start Streaming', admin_video_play_path
  end

  form do |f|
    f.inputs do
      f.input :url
      f.input :title
      f.input :state, as: :select, collection: ['upcoming', 'playing', 'live', 'archived']
      f.input :is_private
      f.input :schedule
      f.input :stream_name
      f.input :is_featured
      f.input :description
      f.input :thumb, required: false, as: :file,  hint: f.object.thumb? ? image_tag(f.object.thumb.url, height: '100') : content_tag(:span, "Upload JPG/PNG/GIF image") 
    end
    f.actions
  end

  permit_params :url, :title, :state, :is_private, :is_featured, :schedule, :stream_name, :thumb, :description
end

