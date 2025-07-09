class Player < ApplicationRecord
  attr_accessor :privacy_policy

  # Associations
  belongs_to :game
  belongs_to :account
  has_many :guesses, dependent: :destroy
  has_many :player_answers, dependent: :destroy
  has_many :feedbacks, dependent: :destroy
  has_many :player_song_plays, dependent: :destroy

  # Validations
  validates :game_id, presence: true
  validates :name, presence: { message: I18n.t("players.name_presence") }
  validates :name, 
            uniqueness: { 
              scope: :game_id, 
              message: I18n.t("players.name_uniqueness") 
            }

  # Scopes
  scope :active, -> { where(active: true) }
  scope :ordered_by_score, -> { order(total_score: :desc) }

  def total_score
    base_score = guesses.sum(:score) || 0
    base_score + additional_points
  end

  def current_round_score
    current_round_id = game.current_round_id
    skipped_song_play_ids = game.song_plays.where(skip_song: true).pluck(:id)
    
    base_score = guesses
      .where(round_id: current_round_id)
      .where.not(song_play_id: skipped_song_play_ids)
      .sum(:score)
    
    base_score + additional_points
  end

  def round_total_score
    song_ids = game.current_round.song_order_ids.flatten.map(&:to_i)
    song_play_ids = SongPlay.where(game_id: game_id, song_id: song_ids)

    total = guesses
      .where(song_play_id: song_play_ids)
      .select(:artist_score, :title_score, :additional_points)
      .sum { |guess| 
        [guess.artist_score, guess.title_score, guess.additional_points]
          .compact
          .sum
      }

    total + additional_points
  end

  def logo
    account&.logo&.url
  end

  def current_song_score
    guesses
      .find_by(song_play_id: game.current_song_id)
      &.song_score || 0
  end

  def has_guessed?
    guesses.exists?
  end

  private

  def additional_points
    self[:additional_points] || 0
  end
end
