class Era < ApplicationRecord
  
  has_many :game_constraints, as: :constraint
  has_many :games, through: :game_constraints

  validates_presence_of :begin_year, :end_year

  scope :active, -> { where(active: true) }
  scope :from_year, (lambda do |year|
    where("begin_year <= ? AND end_year >= ? AND active = ?", year, year, true)
  end)

  def songs
    Song.where(year: self.begin_year..self.end_year, active: true)
  end

  def self.most_popular
     Rails.cache.fetch('most-popular-era', expires_in: 30.minutes) do
       self.where(active: true).sort{|a, b| a.songs.size <=> b.songs.size}.first
     end
  end
end
