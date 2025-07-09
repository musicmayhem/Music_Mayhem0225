class Song < ApplicationRecord
  require 'uri'
  require 'net/http'

  has_many :playlists, through: :playlist_songs
  has_many :song_feedbacks, dependent: :destroy
  has_many :playlist_songs, dependent: :destroy
  has_many :genre_songs
  has_many :era_songs
  has_many :genres, -> { distinct }, through: :genre_songs
  has_many :song_plays
  has_many :single_datas
  has_many :double_datas
  has_many :question_answer_datas
  accepts_nested_attributes_for :single_datas
  after_create :refresh_meta_data
  before_save :trimspaces
  after_save :clear_cache
  scope :active, -> { where(active: true) }
  scope :randomize, -> { order("RANDOM()") }
  scope :play_in_order, -> {order("playlist_songs.position")}

  def streaming_url
    if public_url.present?
      self.increment! :play_count #everytime when asking for streaming_url, increment play count
      return public_url
    else
      if direct_url_expires_at && direct_url_expires_at > 60.minutes.from_now
        self.increment! :play_count
        return direct_url
      else
        begin
          dropbox_file = AdminUser.first.dropbox_client.get_temporary_link path
          self.direct_url_attributes = dropbox_file
          self.increment :play_count
          # SongUpload.perform_async(self.id) # Upload to S3
          save!
          return direct_url
        rescue Exception => e
          puts e.message
          return nil
        end
      end
    end
  end

  def fastest_answer_time
    max_artist_guess = 0;
    max_title_guess = 0;
    self.song_plays.each do |song_play|
      artist_guess = song_play.guesses.present? ? song_play.guesses.maximum(:artist_score) : 0
      title_guess = song_play.guesses.present? ? song_play.guesses.maximum(:title_score) : 0
      max_artist_guess = artist_guess if artist_guess > max_artist_guess
      max_title_guess = title_guess if title_guess > max_title_guess
    end
    if max_artist_guess > max_title_guess
      return max_artist_guess
    else
      return max_title_guess
    end
  end

  def average_answer_time
    sum = 0
    i= 0
    self.song_plays.each do |song_play|
      song_play.guesses.where("artist_score > ? OR title_score > ?", 0 ,0).each do |guess|
        if guess.artist_score > guess.title_score
          sum = sum+guess.artist_score
          i=i+1
        elsif guess.title_score > guess.artist_score
          sum = sum+guess.title_score
          i=i+1
        end
      end
    end
    if i > 0
      return sum/i
    else
      return 0
    end
  end

  def direct_url_attributes=(info)
    self.direct_url = info.link
    self.direct_url_expires_at = 60.minutes.from_now
  end

  def self.playlist_song_csv(options = {})
    attributes = %w{playlist_name id song_id title artist length_in_seconds year created_at updated_at path direct_url direct_url_expires_at play_count itunes_affiliate_url itunes_artwork_url active before_archive_path public_url}
    CSV.generate(headers: true) do |csv|
      csv << attributes
      Playlist.all.each do |playlist|
        playlist.playlist_songs.each do |playlist_song|
          csv << attributes.map{ |column| (column == "playlist_name") ? playlist.name : playlist_song.send(column) }
        end
      end
    end
  end

  def self.song_in_playlist_csv(options = {}, params)
    playlist_id = params[:id]
    attributes = %w{id title artist length_in_seconds year created_at updated_at path direct_url direct_url_expires_at play_count itunes_affiliate_url itunes_artwork_url active before_archive_path public_url}
    CSV.generate(headers: true) do |csv|
      csv << attributes
      Playlist.find(playlist_id).songs.each do |song|
        csv << attributes.map{ |attr| song.send(attr) }
      end
    end
  end

  def clear_cache
    Rails.cache.delete "song_#{id}"
  end

  def file_name
    @file_name ||= Pathname.new(self.path).basename.to_s
  end

  def temp_path
    "tmp/song/#{id}/#{file_name}"
  end

  def refresh_meta_data(dropbox_file=nil)
    return if title.present? && artist.present?
    FileUtils.mkdir_p(File.dirname(temp_path))
    
    uri = URI.parse(streaming_url)
    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == 'https') do |http|
      request = Net::HTTP::Get.new uri
      http.request(request) do |response|
        File.open(temp_path, 'wb') do |saved_file|
          response.read_body do |chunk|
            saved_file.write(chunk)
          end
        end
      end
    end

    if File.exist?(temp_path)
      begin
        Mp3Info.open(temp_path) do |mp3|
          self.title = mp3.tag.title
          self.artist = mp3.tag.artist
          self.year = mp3.tag.year
          self.set_genres(mp3)
          self.length_in_seconds = mp3.length.to_i
          self.populate_info_from_itunes
          self.save
          if Song.where(title: self.title, artist: self.artist).count > 1
            logger.info "Duplicate file removed!!"
            self.destroy!
          end
        end
      rescue => e
        self.destroy!
        logger.info { "Failed to save file #{temp_path} because of #{e}" }
      end
    end
  end


  # def refresh_meta_data(dropbox_file=nil)
  #   return if title.present? && artist.present?
  #   FileUtils.mkdir_p(File.dirname(temp_path))
  #   File.open(temp_path, "wb") do |saved_file|
  #     open(streaming_url, 'rb') do |read_file|
  #       saved_file.write(read_file.read)
  #     end
  #   end
  #   if File.exists?(temp_path)
  #     begin
  #       Mp3Info.open(temp_path) do |mp3|
  #         self.title = mp3.tag.title
  #         self.artist = mp3.tag.artist
  #         self.year = mp3.tag.year
  #         self.set_genres(mp3)
  #         self.length_in_seconds = mp3.length.to_i
  #         self.populate_info_from_itunes
  #         self.save
  #         if Song.where(title: self.title, artist: self.artist).count > 1
  #           logger.info "Duplicate file removed!!"
  #           self.destroy!
  #         end
  #       end
  #     rescue Exception => e
  #       self.destroy!
  #       logger.info { "Failed to save file #{temp_path} because of #{e}" }
  #     end
  #   end
  # end

  def with_mp3_tags(mp3)
    %w(tag tag1 tag2).each do |tag|
      next unless mp3.respond_to? tag
      yield(tag)
    end
  end

  def set_genres(mp3)
    self.genres = []
    with_mp3_tags(mp3) do |tag|
      song_genre = Genre.where(name: mp3.send(tag).genre_s).first
      self.genres << song_genre if song_genre.present? && !self.genres.include?(song_genre)
    end
  end

  def populate_info_from_itunes
    url = URI.parse(URI::DEFAULT_PARSER.escape("https://itunes.apple.com/search?term=#{self.title} #{self.artist}&media=music&entity=song&limit=1"))
    response = Net::HTTP.get_response(url)
    result = JSON.parse(response.body)
    song_hash = result['results'].try(:first)
    return unless song_hash
    affiliate_url = song_hash['collectionViewUrl'] + "?at=11lrYT&ct=music_mayhem"
    self.itunes_affiliate_url = affiliate_url
    self.itunes_artwork_url = song_hash['artworkUrl100']
  end

  def eras
    if self.year
      if self.year.between?(1960,1969)
        Era.where(begin_year: 1960, end_year: 1969)
      elsif self.year.between?(1970,1979)
        Era.where(begin_year: 1970, end_year: 1979)
      elsif self.year.between?(1980,1989)
        Era.where(begin_year: 1980, end_year: 1989)
      elsif self.year.between?(1990,1999)
        Era.where(begin_year: 1990, end_year: 1999)
      elsif self.year.between?(2000,2009)
        Era.where(begin_year: 2000, end_year: 2009)
      elsif self.year.between?(2010,2019)
        Era.where(begin_year: 2010, end_year: 2019)
      end
    end
  end

  def trimspaces
    self.title.squish! if self.title.present?
    self.artist.squish! if self.artist.present?
  end

  def additional_data
    single_data = single_datas.pluck(:single_custom_data)
    double_data = double_datas.pluck(:double_custom_data1, :double_custom_data2)
    question_answer_data = question_answer_datas.pluck(:question, :answer)
    additional_data = { single_data: single_data, double_data: double_data, question_answer_data: question_answer_data }
  end
end
