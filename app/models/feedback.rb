class Feedback < ApplicationRecord
  belongs_to :account
  belongs_to :game
  belongs_to :player
end
