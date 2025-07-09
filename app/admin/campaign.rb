ActiveAdmin.register Campaign do
  # after_create :test

  menu parent: 'Campaign Management'

  member_action :remove_campaign_asset, :method => :delete do
    @campaign_asset = resource.campaign_assets.find(params[:campaign_asset_id])
    if @campaign_asset.destroy
      respond_to do |format|
        format.js { render 'admin/campaigns/remove_campaign_asset' }
        format.html{ redirect_to admin_campaign_path(resource)}
      end
    end
  end

  member_action :remove_series, method: :delete do
    @series = resource.series.find(params[:series_id])
    if @series.update(campaign_id: nil)
      respond_to do |format|
        format.js { render 'admin/campaigns/remove_session' }
        format.html{ redirect_to admin_campaign_path(resource)}
      end
    end
  end

  batch_action :push_mirror, form: ->{ {code: Game.where(created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day, mirror_active: false ).pluck(:code)} } do |ids, game|
    if game
      games = Game.where(campaign_id: ids, created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day )
      original_game = Game.find_by_code(game['code'])
      original_game.update(mirror_active: true)
      games.each do |g|
        Pusher["games_#{g.id}"].trigger('game_event', type: 'mirror_pushed', data: { game_code: game['code']})
      end
      redirect_back fallback_location: root_path, :flash => { :alert => "Mirror game code pushed" }
    end
  end

  batch_action :end_mirror do |ids|
    games = Game.where(created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day, campaign_id: ids, mirror_active: true )
    if(games.count > 0)
      games.each do |game|
        Pusher["games_#{game.id}"].trigger('game_event', type: 'mirror_ended')
        game.update(mirror_active: false)
      end
      redirect_back fallback_location: root_path, :flash => { :alert => "Mirror game(s) ended" }
    end
  end

  batch_action :destroy do |selection|
    selected_campaigns = Campaign.where(id: selection)
    selected_campaigns.map { |campaign|  MongoCampaign.create(campaign_id: campaign.id, campaign_name: campaign.title, action: 'delete', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    selected_campaigns.destroy_all
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Campaigns are Deleted" }
  end

  controller do
    after_action :create_mongo_record, only: [:create, :destroy, :update]

    def update
      super
      Game.last(50).each do |g|
        Pusher["games_#{g.id}"].trigger('game_event', type: 'campaign_updated', data:{ jukebox: params[:campaign][:jukebox] == '1' ? true : false }) if g.state != 'Game Over' && g.game_mode == 'appliance' && g.campaign_id == params[:id].to_i
      end
    end

    def create_mongo_record
      MongoCampaign.create(campaign_id: resource.id, campaign_name: resource.title, action: params['action'] == 'destroy' ? 'delete' : params['action'] == 'update' ?  'edit' : params['action'], actor: current_admin_user&.email, account_id: current_admin_user&.id)
    end
  end

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "playlists"}
    selectable_column
    column :id
    column :title do |item|
      link_to item.title, [:admin, item]
    end
    column :description
    column :duration
    column :created_at
    column :updated_at
    column :mirror_active do |campaign|
      Game.where(campaign_id: campaign.id, created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day, mirror_active: true ).count > 0
    end
    column :player_limit
    column :jukebox
    column :background_music
    column :timer
    column :profile_id
    column :playlist_id
    column :player_pick_playlist
    column :show_on_start
    column :show_between_songs
    actions
  end

show do
  attributes_table do
    row :title
    row :description
    row :background_music
    row :song_count
    row :jukebox
    row :player_pick_playlist
    row :timer
    row :profile_id do |campaign|
        link_to GameProfile.find_by_id(campaign.profile_id).name, admin_game_profile_path(campaign.profile_id) if campaign.profile_id.present?
    end
    row :playlist_id do |campaign|
        link_to Playlist.find_by_id(campaign.playlist_id).name, admin_playlist_path(campaign.playlist_id) if campaign.playlist_id.present?
    end
    row :show_between_songs
    row :show_on_start
    row :duration
    panel "Assets" do
        paginated_collection(resource.campaign_assets.page(params[:page]).per(10)) do
          table_for collection.each do |asset|
            column :name do |asset|
              link_to asset.name, [:admin, asset.asset]
            end
            column :show_on_start do |asset|
              asset.asset.show_on_start
            end
            column :show_during_game do |asset|
              asset.asset.show_during_game
            end
            column :actions do |asset|
  	          link_to 'Remove',  remove_campaign_asset_admin_campaign_path(resource, :campaign_asset_id => asset.id), method: :delete, data: {confirm: 'Remove asset from campaign?'}
  	        end
          end
        end
      end
      panel 'Series' do
        paginated_collection(resource.series.page(params[:page]).per(10)) do
          table_for collection.each do |series|
            column :name do |series|
              link_to series.name, [:admin, series]
            end
            column :actions do |series|
              link_to 'Remove', remove_series_admin_campaign_path(resource, series_id: series.id), method: :delete, data: {confirm: 'Remove series from campaign?'}
            end
          end
        end
      end
  end
end

form do |f|
  f.inputs do
    f.input :title
    f.input :description
    f.input :background_music
    f.input :song_count
    f.input :jukebox
    f.input :player_pick_playlist
    f.input :timer
    f.input :profile_id, :label => 'Game Profile', :as => :select, :collection => GameProfile.all.map {|u| [u.name, u.id]}
    f.input :playlist_id, :label => 'Playlist', :as => :select, :collection => Playlist.all.map {|u| [u.name, u.id]}
    f.input :show_between_songs
    f.input :show_on_start
    f.input :duration
    f.input :player_limit
  end
  f.actions
end
  permit_params :id, :title, :description, :show_between_songs, :show_on_start, :duration, :name, :pagination, :player_limit, :background_music, :song_count, :timer, :jukebox, :profile_id, :playlist_id, :player_pick_playlist

end
