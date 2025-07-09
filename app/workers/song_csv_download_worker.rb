
class SongCsvDownloadWorker
  include Sidekiq::Worker

  def perform(*args)
    logger.info "**************************** UPLOADING CSV TO S3 ****************************"
    s3 = Aws::S3::Resource.new
    bucket = s3.bucket(Rails.configuration.aws[:csv_bucket])
    attributes = %w{id title artist length_in_seconds year created_at updated_at path direct_url direct_url_expires_at play_count itunes_affiliate_url itunes_artwork_url active before_archive_path public_url genre singledata game_code}
    rows = []
    file = CSV.generate(headers: true) do |csv|
      csv << attributes
      sql = "select S.id, S.title, S.artist, S.length_in_seconds, S.year, S.created_at, S.updated_at, S.path, S.direct_url, S.direct_url_expires_at, S.play_count, S.itunes_affiliate_url, S.itunes_artwork_url, S.active, S.before_archive_path, S.public_url, string_agg(DISTINCT G.name, ' | ') as Genre, string_agg(DISTINCT SD.single_custom_data, ' | ') as SingleData, string_agg(DISTINCT GM.code, ' | ') as Game_code FROM songs S LEFT JOIN genre_songs GS ON (S.id = GS.song_id)LEFT JOIN single_data SD ON (S.id = SD.song_id) LEFT JOIN genres G ON (G.id = GS.genre_id) LEFT JOIN song_plays SP ON (SP.song_id = S.id) LEFT JOIN games GM ON (GM.id = SP.game_id) GROUP BY 1"
      songs = ActiveRecord::Base.connection.exec_query(sql)
      songs.each do |song|
        rows << song['id']
        rows << song['title']
        rows << song['artist']
        rows << song['length_in_seconds']
        rows << song['year']
        rows << song['created_at']
        rows << song['updated_at']
        rows << song['path']
        rows << song['direct_url']
        rows << song['direct_url_expires_at']
        rows << song['play_count']
        rows << song['itunes_affiliate_url']
        rows << song['itunes_artwork_url']
        rows << song['active']
        rows << song['before_archive_path']
        rows << song['public_url']
        rows << song['genre']
        rows << song['singledata']
        rows << song['game_code']
        csv << rows
        rows = []
      end
    end
    logger.info file
    obj = bucket.object("songs_data.csv")
    obj.put(body: file, acl: "public-read", content_type: "text/csv")
    logger.info "**************************** UPLOADED CSV TO S3 ****************************"
  end
end
