class GenreSong < ApplicationRecord
  belongs_to :genre, optional: true
  belongs_to :song, optional: true
end
