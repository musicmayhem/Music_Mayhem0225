class Genre < ApplicationRecord
  has_many :genre_songs
  has_many :songs, through: :genre_songs, counter_cache: true

  has_many :game_constraints, as: :constraint
  has_many :games, through: :game_constraints
end
