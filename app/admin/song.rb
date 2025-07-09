ActiveAdmin.register Song do
  menu parent: 'Song Management'

  # after_action :update_in_dropbox, only: [:update]
  config.sort_order = "title_asc"

  controller do
    before_action :set_timezone

    def set_timezone
     user_time_offset = request.cookies["time_offset"].to_i
     Time.zone = ActiveSupport::TimeZone[+user_time_offset]
    end
    def index
      @genre_names = Genre.pluck(:name)
      super
    end
  end

  batch_action :add_to_playlist, form: Hash[Playlist.all.order(:name).map { |e| [e.name, :checkbox] }] do |ids, inputs|
    if inputs.length > 0
      Song.find(ids).each do |song|
        playlist_array = inputs.map{|e| [e[0]]}
        playlist_array.each do |index|
          Playlist.find_by_name(index)&.add_song song
        end
      end
      redirect_back fallback_location: root_path, :flash => {:alert => "Selected songs added to playlist"}
    else
      redirect_back fallback_location: root_path, :flash => {:error => "Failed to batch add. No Play List was selected"}
    end
  end

  filter :title
  filter :artist
  filter :genres
  filter :year
  filter :length_in_seconds
  filter :active

  index do
    render partial: 'admin/shared/set_current_playlist_form', locals: {resource: "songs"}
    selectable_column
    column :title
    column :artist
    column :genres do |song|
      song.genres.map(&:name).join ', '
    end
    column :year, as: :numeric_range
    column :play_count
    column :length_in_seconds, as: :numeric_range
    column :genres do |song|
      get_genres_section(song)
    end
    column :active
    column :single_data do |song|
      song.single_datas.map(&:single_custom_data).join ', '
    end
    column :additional_data do |song|
      get_addtional_data_section(song)
    end

    actions
  end

  show do |song|
    attributes_table do
      row :title
      row :artist
      row :genres do |s|
        s.genres.map(&:name).join ', '
      end
      row :year
      row :play_count
      row :length_in_seconds
      row :active
      row :single_data do |s|
        s.single_datas.map(&:single_custom_data).join ', '
      end
    end
  end

  # show do |playlist|
  #   attributes_table do
  #     row :title
  #     row :artist
  #     row :year
  #     row :length_in_seconds
  #     row :genres do |song|
  #       song.genres.map(&:name).join ', '
  #     end
  #     row :active do |song|
  #       song.active ? "Yes" : "No"
  #     end
  #     row :path
  #     row :direct_url
  #     row :direct_url_expires_at
  #     row :created_at
  #     row :updated_at
  #     row :itunes_affiliate_url
  #     row "Album Artwork" do
  #       image_tag(song.itunes_artwork_url)
  #     end
  #   end
  # end

  # form do |f|
  #   f.inputs :title
  #   f.inputs :artist
  #   f.inputs :year
  #   f.inputs :length_in_seconds
  #   f.inputs :genres
  #   f.inputs :active
  #   f.actions :commit
  # end
  #
  sidebar :help, only: :index do
    #This sidebar is for putting the form, which can not be nested in index and have nowhere to go
    # render 'admin/shared/index_help_sidebar'
    render 'admin/songs/download_song_data'
  end
  # # sidebar :current_playlist, except: :index do
  #   # render 'admin/shared/current_playlist_sidebar'
  # # end
  #
  # filter :title
  # filter :artist
  # filter :year, as: :numeric_range
  # filter :length_in_seconds, as: :numeric_range
  # filter :genres, as: :select, input_html: {multiple: true, class: 'select2-enabled'}
  # filter :active, as: :select
  # filter :single_datas_single_custom_data, label:"Additional Data Single",as: :string
  # filter :double_datas_double_custom_data1_or_double_datas_double_custom_data2, label:"Additional Data Double",as: :string
  # filter :question_answer_datas_question_or_question_answer_datas_answer, label:"Additional Data Question Answer",as: :string
  #
  # batch_action :add, :confirm => 'Add Selected to Current Playlist?' do |selection|
  #   @playlist = session[:current_playlist] && Playlist.find(session[:current_playlist])
  #   if(@playlist)
  #     Song.find(selection).each do |song|
  #       @playlist.add_song song
  #     end
  #     @playlist.save
  #     redirect_back fallback_location: root_path, :flash => { :alert => "Added song to Current Playlist" }
  #   else
  #     redirect_back fallback_location: root_path, :flash => {:error => "Failed to batch add. No Current Playlist was set."}
  #   end
  # end
  # batch_action :active do |selection|
  #   Song.find(selection).each do |song|
  #     song.update_attribute :active, true
  #   end
  #   redirect_back fallback_location: root_path, :flash => {:alert => "Selected songs are active"}
  # end
  # batch_action :inactive do |selection|
  #   Song.find(selection).each do |song|
  #     song.update_attribute :active, false
  #   end
  #   redirect_back fallback_location: root_path, :flash => {:alert => "Selected songs are inactive"}
  # end
  # batch_action :add, form: Hash[Playlist.all.map { |e| [e.name, :checkbox] }] do |ids, inputs|
  #   if inputs.length > 0
  #     Song.find(ids).each do |song|
  #       playlist_array = inputs.map{|e| [e[0]]}
  #       playlist_array.each do |index|
  #         Playlist.find_by_name(index).add_song song
  #       end
  #     end
  #     redirect_back fallback_location: root_path, :flash => {:alert => "Selected songs added to playlist"}
  #   else
  #     redirect_back fallback_location: root_path, :flash => {:error => "Failed to batch add. No Play List was selected"}
  #   end
  # end
  # member_action :add_to_playlist, :method => :post do
  #   @current_song = Song.find(params[:id])
  #   @playlist = session[:current_playlist] && Playlist.find(session[:current_playlist])#scope current playlist to current_admin_user
  #   if @playlist
  #     @playlist.add_song @current_song
  #     @playlist.save
  #     respond_to do |format|
  #       format.js { render 'admin/songs/add_to_playlist' }
  #     end
  #   end
  # end
  #
  # controller do
  #
  #   def clean_search_params(params)
  #     if params.is_a? Hash
  #       params.dup.delete_if{ |key, value| value.blank? }
  #     else
  #       {}
  #     end
  #   end
  #
  #   def apply_filtering(chain)
  #     @search = chain.ransack clean_search_params params[:q]
  #     @search.result(distinct: true)
  #   end
  #   def update_in_dropbox
  #     SongUpdate.perform_async(params[:id])
  #   end
  #   # def index
  #   #   @genre_names = Genre.pluck(:name)
  #   #   super
  #   # end
  # end
  #
  # action_item :only => [:show, :edit] do
  #   @current_song = Song.find(params[:id])
  #   if @current_song.active
  #     link_to "Play", @current_song.streaming_url, target: "_blank"
  #   end
  # end
  # action_item :only => [:show, :edit] do
  #   @current_song = Song.find(params[:id])
  #   if @current_song.active
  #     link_to "Archive", archive_song_path(@current_song), confirm: "Are you sure you want to archive this song?"
  #   else
  #     link_to "Unarchive", unarchive_song_path(@current_song), confirm: "Are you sure you want to unarchive this song?"
  #   end
  # end
  # action_item :only => :show do
  #   link_to "Add To Current Playlist", add_to_playlist_admin_song_path(resource.id), :remote => 'true', :method => :post, :confirm => 'Add to Current Playlist?'
  # end
  permit_params :title, :length_in_seconds, :artist, :year, :active, genre_ids: []
end
