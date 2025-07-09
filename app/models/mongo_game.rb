class MongoGame
  include Mongoid::Document
  include Mongoid::Timestamps

  field :game_id, type: Integer
  field :game_code, type: String
  field :session_id, type: Integer
  field :account_id, type: Integer
  field :action, type: String
  field :actor, type: String

  validates_presence_of :game_id, :game_code

end
