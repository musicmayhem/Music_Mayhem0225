class PlayerAnswer < ApplicationRecord
  belongs_to :player
  has_one :game, through: :player
  validates_presence_of :player_id
end
