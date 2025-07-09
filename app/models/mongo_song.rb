class MongoSong
  include Mongoid::Document
  include Mongoid::Timestamps

  field :song_id, type: Integer
  field :song_title, type: String
  field :song_artist, type: String
  field :song_year, type: Integer
  field :song_era, type: String
  field :song_genre_names, type: Array, default: []

  validates_presence_of :song_id

end
