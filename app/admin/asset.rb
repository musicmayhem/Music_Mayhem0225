ActiveAdmin.register Asset do
  menu parent: 'Campaign Management'

  controller do
    before_action :set_timezone

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
  end

  show do
    attributes_table do
      row :created_at
      row :updated_at
      row :show_on_start
      row :show_during_game
      row :campaign_title do |item|
        item.campaign_ids.collect{ |g| link_to Campaign.find(g).title , '/admin/campaigns/' + g.to_s }.join(', ').html_safe
      end
      row :name
      row :trivia_asset
    end
  end

  index do
    selectable_column
    column :id do |item|
       item.id
    end
    column :name do |item|
      link_to item.name, [:admin, item]
    end
    column :campaign_title do |item|
      item.campaign_ids.collect{ |g| link_to Campaign.find(g).title , '/admin/campaigns/' + g.to_s }.join(', ').html_safe
    end
    column :show_on_start
    column :show_during_game
    column :trivia_asset
    actions
  end
  form do |f|
    f.inputs do
      f.input :campaign_ids, as: :check_boxes, input_html: { multiple: true }, :label => 'Select Campaign',  :collection => Campaign.all.map {|u| [u.title, u.id]}
      f.input :adv_image
      f.input :iframe_url
      f.input :trivia_asset
      f.input :show_during_game
      f.input :show_on_start
      f.input :name
    end
    f.actions
  end

  permit_params :id, :adv_image, :adv_image_file_name,:iframe_url,:display_banner, :name,:show_on_start, :show_during_game , :asset_id, :trivia_asset, campaign_ids: []
end
