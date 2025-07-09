class PlaylistSongDownloadWorkerWorker
  include Sidekiq::Worker

  def perform(*args)
    logger.info "**************************** UPLOADING PLAYLIST SONG CSV TO S3 ****************************"
    s3 = Aws::S3::Resource.new
    bucket = s3.bucket(Rails.configuration.aws[:csv_bucket])

    file = Song.playlist_song_csv(col_sep: "\t")
    logger.info file
    obj = bucket.object("all_playlist_songs.csv")
    obj.put(body: file, acl: "public-read", content_type: "text/csv")
    logger.info "**************************** UPLOADEDCSV TO S3 ****************************"
  end
end
