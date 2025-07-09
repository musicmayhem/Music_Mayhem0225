class MongoSongPlay
  include Mongoid::Document
  include Mongoid::Timestamps

  field :song_play_id, type: Integer
  field :song_id, type: Integer
  field :song_count, type: Integer
  field :game_id, type: Integer
  field :round_id, type: Integer
  field :player_id, type: Integer
  field :account_id, type: Integer
  field :seconds_title_answer, type: Float
  field :seconds_artist_answer, type: Float
  field :seconds_year_answer, type: Float
  field :title_score, type: Integer, default: 0
  field :artist_score, type: Integer, default: 0
  field :year_score, type: Integer, default: 0
  field :total_score, type: Integer, default: 0
  field :song_rank, type: Integer
  field :round_rank, type: Integer
  field :game_rank, type: Integer

  validates_presence_of :song_play_id, :game_id, :round_id, :player_id
end
