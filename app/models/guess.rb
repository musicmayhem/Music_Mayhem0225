require "mini-levenshtein"

class Guess < ApplicationRecord
  GOOD_MATCH_PERCENTAGE = 0.75

  belongs_to :song_play
  belongs_to :player
  has_one :game, through: :player
  has_one :song, through: :song_play
  before_save :clear_cache

  after_initialize :set_defaults #default values
  after_validation :calculate_scores

  validates_presence_of :player_id
  validates_presence_of :song_play_id

  validates_numericality_of :title_score, :greater_than_or_equal_to => 0
  validates_numericality_of :artist_score, :greater_than_or_equal_to => 0
  validates_numericality_of :year_score, :greater_than_or_equal_to => 0

  attr_accessor :submitted_at, :player_guess, :song_title, :song_artist, :song_year, :player_status

  def set_defaults
    self.title_score  ||= 0
    self.artist_score ||= 0
    self.year_score ||= 0
  end

  def score
    artist_score + title_score + year_score + additional_points
  end

  def song_score
    artist_score + title_score + year_score
  end

  def song
    song_play.song
  end

  protected

  def calculate_scores
    if title_changed? && !game.show_year_hint && match_string(song_title, title, title_was)
       set_title_score_and_time
    else
      self.title = title_was
    end
    if artist_changed? && match_string(song_artist, artist, artist_was)
       set_artist_score_and_time
    else
      self.artist = artist_was
    end
    if year_changed? && game.show_year_hint && match_string(song_year.to_s, year, year_was)
       set_year_score_and_time
    else
      self.year = year_was
    end
  end

  def match_string(pattern, search, prev_search = nil)
    percentage = MiniLevenshtein.similarity(clean(pattern), clean(search))
    prev_percentage = MiniLevenshtein.similarity(clean(pattern), clean(prev_search)) rescue 0
    # percentage = clean(pattern).levenshtein_similar(clean(search))
    # prev_percentage = clean(pattern).levenshtein_similar(clean(prev_search)) rescue 0
    puts GOOD_MATCH_PERCENTAGE, percentage
    percentage > GOOD_MATCH_PERCENTAGE  && percentage >= prev_percentage
  end

  def clean(string)
    string.downcase.strip.gsub(/[^\w]/, "")
  end

  def set_title_score_and_time
    self.title_score = new_score if new_score > self.title_score
    self.seconds_title_answer = elapsed_time
  end

  def set_artist_score_and_time
    self.artist_score = new_score if new_score > self.artist_score
    self.seconds_artist_answer = elapsed_time
  end

  def set_year_score_and_time
    self.year_score = new_score if new_score > self.year_score
    self.seconds_year_answer = elapsed_time
  end

  def new_score
    max_possible_value = player_status == 'muted' ? game.current_round.point_value.to_i / 2 : game.current_round.point_value.to_i
    points = ((game.current_round.guess_timer.to_i - elapsed_time ) / game.current_round.guess_timer.to_i) * max_possible_value
    return max_possible_value if points > max_possible_value
    points
  end

  def elapsed_time
    submitted_at - (song_play.started_at.to_time + (game.current_round.letter_start_time.to_i).seconds + song_play.time_offset)
  end

  def clear_cache
    Rails.cache.delete "guess_#{id}"
  end

end
