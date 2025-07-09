module Api
  module V1
    class SongsController < ApplicationController

    def feedback
      params.permit!
      feedback = SongFeedback.new(params[:feedback])
      feedback.save
      if feedback.valid?
        render json: { message: "Thanks! We will review this song soon!" }, status: :ok
      else
        render json: { message: "Sorry! Unable to submit your feedback." }, status: :bad_request
      end
    end

    def archive_song
      if request.xhr?
        @song=Song.find(params[:id])
        begin
          client = Dropbox::API::Client.new(:token  => AdminUser.first.dropbox_access_token, :secret =>  AdminUser.first.dropbox_secret_token)
          if !client.ls '/archive'
            client.mkdir 'archive'
          end
          file = client.find @song.path
          file.move "/archive/#{@song.file_name}"
          @song.update_attributes(before_archive_path: @song.path, path:"archive/#{@song.file_name}", active: false)
        rescue Exception => e
          puts "Some error"+e
        end
      else
        SongArchive.perform_async(params[:id])
        redirect_to admin_songs_path
      end
    end

    def unarchive_song
      if request.xhr?
        @song=Song.find(params[:id])
        begin
          client = Dropbox::API::Client.new(:token  => AdminUser.first.dropbox_access_token, :secret =>  AdminUser.first.dropbox_secret_token)
          if !client.ls '/archive'
            client.mkdir 'archive'
          end
          file = client.find @song.path
          file.move @song.before_archive_path
          @song.update_attributes(path:@song.before_archive_path, active: true, before_archive_path: nil)
        rescue Exception => e
          puts "Some Error"
        end
      else
        SongUnarchive.perform_async(params[:id])
        redirect_to admin_songs_path
      end
    end

    def admin_active_inactive_song
      @song=Song.find(params[:id])
      if @song.active
        @song.update_attribute :active, false
      else
        @song.update_attribute :active, true
      end
    end

    def admin_update_song
      @song=Song.find(params[:id])
      if params[:title].present?
        @song.update_attribute :title, params[:title]
      elsif params[:artist].present?
        @song.update_attribute :artist, params[:artist]
      elsif params[:year].present?
        @song.update_attribute :year, params[:year]
      elsif params[:active].present?
        @song.update_attribute :active, params[:active]
      elsif params[:genres].present?
        @song.genre_songs.destroy_all
        if params[:genres].last != "None"
          params[:genres].each do |genre|
            genre_id = Genre.find_by_name(genre).id
            @song.genre_songs.new(genre_id: genre_id).save
          end
        end
        render :json => {"id" => @song.id, "genre_names" => @song.genres.map(&:name).join(', ')}
        return true
      end
      SongUpdate.perform_async(@song.id)
      render :json => @song
    end

    def admin_play_song
      @song=Song.find(params[:id])
      render :json => {"playing_url" => @song.streaming_url}
    end

    def get_expanded_data
      @song= Song.find(params[:id])
      render :json => {"single_datas" => @song.single_datas, "double_datas" => @song.double_datas, "question_answer_datas" => @song.question_answer_datas}
    end

    def download_song_data
      SongCsvDownloadWorker.perform_async
      redirect_to admin_songs_path
      flash[:success] = "CSV uploaded to S3"
    end

    def download_playlist_song_data
      require "csv"
      respond_to do |format|
        format.html
        format.xls { send_data Song.playlist_song_csv(col_sep: "\t"), filename: "all_playlist_songs_#{Date.today}.csv" }
      end
    end

    def download_songs_in_playlist
      playlist_id = params["id"]
      playlist_name = Playlist.find(playlist_id).name
      require "csv"
      respond_to do |format|
        format.html
        format.xls { send_data Song.song_in_playlist_csv(col_sep: "\t", id: playlist_id), filename: "songs_in_playlist_#{playlist_name}.csv" }
      end
    end

    def admin_update_song_custom_data
      @song = Song.find(params[:id])
      if params[:single_data].present?
        @song.single_datas.destroy_all
        params[:single_data].each do |single_data|
          @song.single_datas.create(single_custom_data: single_data) if single_data.present?
        end
      elsif params[:double_data].present?
        @song.double_datas.destroy_all
        params[:double_data].each do |key,value|
          @song.double_datas.create(double_custom_data1: key, double_custom_data2: value) if key.present?
        end
      elsif params[:question_data].present?
        @song.question_answer_datas.destroy_all
        params[:question_data].each do |key,value|
          @song.question_answer_datas.create(question: key, answer: value) if key.present?
        end
      end
      render :json => @song
    end

    private

    def resource
      Round.find(params[:round_id]).game.rounds.last
    end

    def authenticate_users
      if current_admin_user.present?
        :authenticate_admin_user!
      elsif current_account.present?
        :authenticate_account!
      end
      end
    end
  end
end
