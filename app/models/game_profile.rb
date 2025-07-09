class GameProfile < ApplicationRecord
  has_many :games, foreign_key: :profile_id
  belongs_to :playlist, optional: true
end
