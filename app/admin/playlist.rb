ActiveAdmin.register Playlist do
  menu parent: 'Song Management'

  config.sort_order = "name_asc"

  filter :name
  filter :access

  sortable

  controller do
    before_action :set_timezone
    after_action :create_mongo_record, only: [:create, :destroy, :update]

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end

    def create_mongo_record
      MongoPlaylist.create(playlist_id: resource.id, playlist_name: resource.name, action: params['action'] == 'destroy' ? 'delete' : params['action'] == 'update' ?  'edit' : params['action'], actor: current_admin_user&.email, account_id: current_admin_user&.id )
    end

  end


  skip_before_action :verify_authenticity_token, :only => [:current_playlist, :destroy_current_playlist]

  collection_action :current_playlist, :method => :post do
    @current_playlist = scoped_collection.find(params[:id])
    session[:current_playlist] = params[:id]
    respond_to do |format|
      format.js { render 'admin/playlists/set_current_playlist' }
    end
  end

  collection_action :destroy_current_playlist, :method => :delete do
    session[:current_playlist] = nil
    respond_to do |format|
      format.js { render 'admin/playlists/destroy_current_playlist' }
    end
  end

  member_action :remove_playlist_song, :method => :delete do
    @playlist_song = resource.playlist_songs.find_by_id(params[:playlist_song_id])
    p resource
    if @playlist_song&.destroy
      respond_to do |format|
        format.js { render 'admin/playlists/remove_playlist_song' }
        format.html{ redirect_to admin_playlist_path(resource)}
      end
    end
  end

  batch_action :destroy do |selection|
    selected_playlists = Playlist.where(id: selection)
    selected_playlists.map { |playlist|  MongoPlaylist.create(playlist_id: playlist.id, playlist_name: playlist.name, action: 'delete', actor: current_admin_user&.email, account_id: current_admin_user&.id ) }
    selected_playlists.destroy_all
    redirect_back fallback_location: root_path, :flash => { :alert => "Selected Playlists are Deleted" }
  end

  #sort song.  uses :id
  member_action :sort, :method => :post do
    unless params[:position].blank?
      @playlist_song = PlaylistSong.find(params[:id])
      render :text => @playlist_song.update_attributes(:position => params[:position])
    end
  end

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "playlists"}
    selectable_column
    column :name do |item|
      link_to item.name, [:admin, item]
    end
    column :access do |item|
      item.access.present? ? item.access.capitalize : nil
    end
    actions
  end

  show do |playlist|
    attributes_table do
      row :name
      row :created_at
      row :updated_at
    end

    panel "Songs" do
    	paginated_collection(resource.playlist_songs.page(params[:page]).per(50)) do
        p resource.playlist_songs
	      table_for collection.each do |song|
	        sortable_handle_column
	        column :title do |song|
	          link_to song.title, [:admin, song.song] if song.song.present? && Song.find_by_id(song.song_id).try(:active)
	        end
	        column :artist
	        column :length_in_seconds
	        column :year
	        column :genres do |song|
	          song.song.genres.collect{ |g| link_to g.name, [:admin, g] }.join(', ').html_safe if song.song.present? && Song.find_by_id(song.song_id).try(:active)
	        end
	        column :actions do |song|
	          link_to 'Remove', remove_playlist_song_admin_playlist_path(resource, :playlist_song_id => song.id), method: :delete, data: {confirm: 'Remove song from playlist?'}
	        end
	      end
	    end
    end
  end

  form do |f|
    f.semantic_errors *f.object.errors.keys
    f.inputs "Create Playlist" do
      f.input :account_id, input_html: {value: 23}, :as => :hidden
      f.input :name
      f.input :access,:as => :select,collection: [['Free', 'free'],['Personal', 'personal'],['Professional', 'professional'], ["Private","private"], ["Public","public"],["Demo","demo"]],:include_blank => false
    end
    f.actions
  end


  sidebar :Songs_in_playlist, only: :show do
    render 'admin/songs/download_songs_in_playlist'
  end

  sidebar :Playlist_Data, only: :index do
    #This sidebar is for putting the form, which can not be nested in index and have nowhere to go
    render 'admin/songs/download_playlist_song_data'
  end

  permit_params :pagination,:name,:access, :account_id,:id
end
