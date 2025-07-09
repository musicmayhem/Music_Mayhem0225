class MongoPlaylist
  include Mongoid::Document
  include Mongoid::Timestamps

  field :playlist_id, type: Integer
  field :playlist_name, type: String
  field :action, type: String
  field :actor, type: String
  field :account_id, type: Integer

  validates_presence_of :playlist_id

end
