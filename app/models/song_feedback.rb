class SongFeedback < ApplicationRecord
  belongs_to :song
	belongs_to :game
	validates_presence_of :song_id, :game_id, :name, :created_by
end
