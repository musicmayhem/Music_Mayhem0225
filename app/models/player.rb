class Player < ApplicationRecord
    attr_accessor :privacy_policy

  belongs_to :game
  belongs_to :account
  has_many :guesses
  has_many :player_answers
  has_many :feedbacks
  has_many :player_song_plays

  validates_presence_of :game_id
  validates_presence_of :name, :message => I18n.t("players.name_presence")
  validates_uniqueness_of :name, :scope => :game_id, :message => I18n.t("players.name_uniqueness")


  def total_score
    score = guesses.map(&:score).inject{|sum,x| sum + x } || 0
    score + additional_points
  end

  def current_round_score
    current_round_id = game.current_round_id
    song_play_id = game.song_plays.where(skip_song: true).pluck(:id)
    score = guesses.where(round_id: current_round_id).where.not(song_play_id: song_play_id).map(&:score).sum
    score + additional_points
  end

  def round_total_score
    song_id = SongPlay.where(game_id: game_id, song_id: game.current_round.song_order_ids.flatten.map(&:to_i))
    additional_points + guesses.where(song_play_id: song_id).pluck(:artist_score, :title_score, :additional_points).flatten.compact.sum
  end

  def logo
    Account.find_by_email(email)&.logo&.url
  end

  def current_song_score
    guesses.where(song_play_id: game.current_song_id).first.song_score rescue 0
  end
  def has_guessed?
    !guesses.count.zero?
  end
end
