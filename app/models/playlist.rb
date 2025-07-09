class Playlist < ApplicationRecord
  belongs_to :account

  has_many :playlist_songs #, -> { order("RANDOM()") }
  has_many :songs, through: :playlist_songs
  has_many :game_profiles
  has_many :campaigns
  after_destroy :update_dependents

  def aggregate_years_by_decade_formatted
    decades = []
    aggregate_years_by_decade.each do |decade_start, song_count|
      if decade_start.to_i > 1800
        decade = (decade_start.to_i % 100).zero? ? "00's" : "#{(decade_start.to_i % 100)}'s"
        decades << [decade, song_count.to_s]
      end
    end
    decades
  end

  def aggregate_years_by_decade
    songs.group("FLOOR(year / 10) * 10").count
  end

  def update_eras
    update_columns(eras: aggregate_years_by_decade_formatted)
  end

  def add_song(song)
    self.songs << song unless self.songs.include? song
  end

  def self.user_playlist
    joins(:songs).where("access = 'public' OR access = 'personal' OR access='free'").where('songs.active = true').group("playlists.id", "playlists.name").order("playlists.name").count.map{|x| x.flatten}
  end

  def self.player_playlist
    joins(:songs).where(access: 'free').where('songs.active = true').group("playlists.id", "playlists.name").order("playlists.name").count.map{|x| x.flatten}
  end

  def self.admin_playlist
    joins(:songs).where("access = 'public' OR access = 'personal' OR access='free' OR access='professional' OR access='private'").where('songs.active = true').group("playlists.id", "playlists.name").order("playlists.name").count.map{|x| x.flatten}
  end

  def self.public_playlist
    joins(:songs).where("access = 'public' OR access = 'personal' OR access='free' OR access='professional'").where('songs.active = true').group("playlists.id", "playlists.name").order("playlists.name").count.map{|x| x.flatten}
  end

  def self.organization_playlist
    joins(:songs).where("access = 'public' OR access = 'personal' OR access='free' OR access='professional'").where('songs.active = true').group("playlists.id", "playlists.name").order("playlists.name").count.map{|x| x.flatten}
  end

  def get_filtered_songs(eras, genres)
    playlist_eras = eras.map(&:to_i)
    playlist_genre_ids = Genre.where(name: genres).pluck(:id)
    era_years=[]
    playlist_eras.each do |era|
     if era<=30
       era+=2000
       era_years+=(era..era+9).to_a
     else
       era+=1900
       era_years+=(era..era+9).to_a
     end
    end
    if playlist_genre_ids.count == 0 && playlist_eras.count == 0
      playlist_songs.joins(:song).pluck(:song_id)
    elsif playlist_genre_ids.count == 0 && playlist_eras.count > 0
      playlist_songs.joins(:song).where(songs: { year: era_years }).pluck(:song_id)
    elsif playlist_eras.count == 0 && playlist_genre_ids.count > 0
      playlist_songs.joins(:song).joins(song: [:genre_songs]).where("genre_songs.genre_id IN (?)", playlist_genre_ids).uniq.pluck(:song_id)
    else
      playlist_songs.joins(:song).joins(song: [:genre_songs]).where("genre_songs.genre_id IN (?) AND songs.year IN (?)", playlist_genre_ids, era_years).uniq.pluck(:song_id)
    end
  end

  def self.check_playlist(current_account)
    return public_playlist if current_account.charges.present? && current_account.charges.last.expiring_at > Time.now
    return player_playlist  if current_account.role == 'player'
    return admin_playlist if current_account.role == 'admin' || current_account.role == 'host'
    return user_playlist if current_account.role == 'user'
    return organization_playlist if current_account.role == 'organization'
  end

  private
    def update_dependents
      #removing playlist_id from associated game_profiles
      game_profiles.map {|gp| gp.update(playlist_id: nil)}
      #removing playlist_id from associated campaigns
      campaigns.map {|campaign| campaign.update(playlist_id: nil)}
    end
end
