class PlayerSongPlay < ActiveRecord::Base
  belongs_to :player
  belongs_to :song
end
