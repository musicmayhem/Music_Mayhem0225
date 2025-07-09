class SongPlay < ApplicationRecord
  belongs_to :game
  belongs_to :song
  has_many :guesses

  def pause
    self.touch(:paused_at)
  end

  def paused?
    self.paused_at.present?
  end

  def resume
    self.time_offset = self.time_offset + (Time.now - self.paused_at).seconds.ceil unless !self.paused?
    self.paused_at = nil
    save!
  end
end
