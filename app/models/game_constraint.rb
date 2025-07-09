class GameConstraint < ApplicationRecord
  belongs_to :game
  belongs_to :constraint, polymorphic: true
end
