class Round < ApplicationRecord
  store_accessor :settings, :song_count, :playlist_id, :campaign_id, :era_ids, :genre_ids, :song_ids, :total_play_length, :fade_out_length,
                 :guessing_length, :guessing_percentage, :letter_start_time, :manual_control, :song_play_time,
                 :allowed_to_continue, :adv_duration,:leaderboard_display_time,:game_over_display_time,:point_value,:guess_timer,:background_music_playlist

  belongs_to :game
  has_many :players

  after_initialize :set_defaults
  before_save :set_defaults, :clear_cache

  def set_defaults
    self.era_ids             ||= []
    self.genre_ids           ||= []
    self.song_ids            ||= []
    self.manual_control      ||= false
    self.total_play_length   ||= 75
    self.fade_out_length     ||= 10
    self.guessing_length     ||= 100
    self.guessing_percentage ||= 70
    self.letter_start_time   ||= 0
    self.song_play_time      ||= 120 #consider remove this column?
    self.song_count          ||= ENV['DEFAULT_SONG_COUNT'] || 11 # allow all songs to be played
    self.adv_duration        ||= 5
    self.point_value        ||= 100
    self.guess_timer        ||= 100
    self.leaderboard_display_time ||= 20
    self.game_over_display_time ||= 30
  end

  def songs
    scoped = Song.active.order("RANDOM()")
    if self.game.prev_games_ids.blank?
      if self.playlist.present?
          p_songs = playlist.songs.pluck(:id)
          ap_songs = game.already_played_song_ids
          unplayed_songs = p_songs - ap_songs
        if self.game.random_play
          scoped = Song.where(id: unplayed_songs).randomize
        else
          scoped = Song.where(id: unplayed_songs)
          # scoped = self.playlist.songs.play_in_order if self.playlist.present?
        end
      end
    else
      song_ids_played = []
      self.game.prev_games_ids.each do |game_id|
        song_ids_played = song_ids_played + eval(Game.find(game_id).rounds.first.song_ids)
      end
      scoped = self.playlist.songs.where('song_id NOT IN (?)',song_ids_played) if self.playlist.present?
    end
    scoped = scoped.where(year: era_ranges) unless self.era_ids.empty?
    scoped = scoped.joins(:genre_songs).where("genre_songs.genre_id in (?)", self.genre_ids) unless self.genre_ids.empty?
    scoped = scoped.order("RANDOM()") if self.game.name == 'solo' #randomize songs for solo
    scoped = scoped.limit(self.song_count) if self.song_count.present?
    if eval(self.song_ids).empty?
      self.song_ids = scoped.map(&:id)
    else
      scoped = Song.where("id IN (?)", eval(self.song_ids))
    end
    scoped
  end

  def genre_ids
    JSON.parse super if super
  end

  def genre_ids=(ids)
    ids.delete_if(&:nil?)
    super ids.to_json
  end

  def genres
    Genre.where(id: self.genre_ids)
  end

  def genres=(array)
    if array.respond_to?(:pluck)
      ids = array.pluck(:id)
    elsif array.respond_to?(:collect)
      ids = array.collect(&:id)
    else
      ids = array.delete_if(&:empty?)
    end
    self.genre_ids = ids
  end

  def era_ids
    JSON.parse super if super
  end

  def era_ids=(ids)
    ids.delete_if(&:nil?)
    super ids.to_json
  end

  def eras
    Era.where(id: self.era_ids)
  end

  def era_ranges
    self.eras.map {|era| era.begin_year..era.end_year}
  end

  def playlist
    Playlist.where(id: self.playlist_id).first
  end

  def playlist=(playlist)
    self.playlist_id = playlist.id
  end

  def clear_cache
    Rails.cache.delete "round_#{id}" if id
  end

end
