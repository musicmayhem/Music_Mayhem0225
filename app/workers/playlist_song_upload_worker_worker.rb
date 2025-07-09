class PlaylistSongUploadWorkerWorker
  include Sidekiq::Worker

  def perform(*args)
    logger.info "**************************** GETTING CSV FROM S3 ****************************"
    s3 = Aws::S3::Resource.new
    csv_text = open('https://s3.amazonaws.com/csv-mayhem/uploaded_playlist_song_data.csv')
    csv = CSV.parse(csv_text, :headers=>true)
    csv.each do |hash|
      logger.info "#{hash}========================"
      logger.info "**************************** READING #{hash["playlist_name"]} from CSV ****************************"
      playlist = Playlist.find_by_name(hash["playlist_name"])
      song = Song.find_by_id(hash["song_id"])
      if playlist.present?
        logger.info "==================playlist present"
        song_id = song.id if song
        if PlaylistSong.find_by(song_id: song_id,playlist_id: playlist.id).present?
        else
          PlaylistSong.create(song_id: song_id, playlist_id: playlist.id)
        end
      else
        logger.info "=============creating playlist"
        account = Account.find_by_email("admin@example.com")
        Playlist.create(name: hash["playlist_name"],account_id: account.id)
      end
      logger.info "**************************** Playlist Created ****************************"
    end
    logger.info "**************************** PLAYLIST IMPORT FINISHED ****************************"
  end
end