class SongCsvUploadWorker
  include Sidekiq::Worker

  def perform(*args)
    logger.info "**************************** GETTING CSV FROM S3 ****************************"
    csv_text = open('https://s3.amazonaws.com/csv-mayhem/uploaded_song_data.csv')
    csv = CSV.parse(csv_text, :headers=>true)
    csv.each do |hash|
      logger.info "============================#{hash}"
      song = Song.find_by_id(hash["id"])
      if song.present?
        song_value = {title: hash["title"], artist: hash["artist"],active: hash["active"], year: hash["year"],public_url: hash['public_url']}
        Song.find_by_id(hash["id"]).update!(song_value.compact)
        if hash["singledata"].present?
          if SingleData.find_by_song_id(song.id).present?
            SingleData.find_by_song_id(song.id).update(single_custom_data: hash["singledata"])
          else
            SingleData.create!(song_id: hash["id"],single_custom_data: hash["singledata"])
          end
        else
          if SingleData.find_by_song_id(song.id).present?
            SingleData.find_by_song_id(song.id).delete
          end
        end
        if hash["genre"].present?
          list = hash["genre"]
          genres = Array.new(list.split(" | "))
          genres.each do |genre|
            genre_id = Genre.find_by_name(genre)&.id
            if genres.count >= 2
              if GenreSong.find_by(song_id: song.id, genre_id: genre_id).present?
                GenreSong.find_by(song_id: song.id, genre_id: genre_id).update(song_id: song.id, genre_id: genre_id)
              else
                GenreSong.create!(song_id: song.id, genre_id: genre_id)
              end
            else
              if GenreSong.where(song_id: song.id).present?
                GenreSong.where(song_id: song.id).delete_all
              end
              GenreSong.create!(song_id: song.id, genre_id: genre_id)
            end
          end
        end
      else
        hash.delete(:singledata)
        hash.delete(:genre)
        hash.delete(:game_code)
        Song.create!(
          id: hash["id"] || nil,
          title: hash["title"] || nil,
          artist: hash["artist"] || nil,
          public_url: hash["public_url"] || nil,
          length_in_seconds: hash["length_in_seconds"] || nil,
          year: hash["year"] || nil,
          path: hash["path"] || nil,
          play_count: hash["play_count"] || nil,
          itunes_affiliate_url: hash["itunes_affiliate_url"] || nil,
          itunes_artwork_url: hash["itunes_artwork_url"] || nil,
          active: hash["active"] || nil,
          created_at: hash["created_at"] || nil,
          updated_at: hash["updated_at"] || nil,
          direct_url_expires_at: hash["direct_url_expires_at"] || nil,
          direct_url: hash["direct_url"] || nil
        )
        logger.info "**************************** SONG Created ****************************"
      end
    end
    logger.info "**************************** SONG IMPORT FINISHED****************************"
  end
end
