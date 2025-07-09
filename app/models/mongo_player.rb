class MongoPlayer
  include Mongoid::Document
  include Mongoid::Timestamps

  field :player_id, type: Integer
  field :game_id, type: Integer
  field :player_name, type: String
  field :player_email, type: String
  field :account_id, type: Integer

  validates_presence_of :player_id, :player_email, :account_id, :game_id

end
