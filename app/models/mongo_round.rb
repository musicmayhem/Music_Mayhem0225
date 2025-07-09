class MongoRound
  include Mongoid::Document
  include Mongoid::Timestamps

  field :round_id, type: Integer
  field :round_count, type: Integer
  field :playlist_id, type: Integer
  field :game_id, type: Integer
  field :game_code, type: String
  field :account_id, type: Integer
  field :action, type: String
  field :actor, type: String

  validates_presence_of :round_id, :round_count, :game_id

end
