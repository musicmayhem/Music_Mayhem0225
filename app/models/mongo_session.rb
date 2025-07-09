class MongoSession
  include Mongoid::Document
  include Mongoid::Timestamps

  field :session_id, type: Integer
  field :session_name, type: String
  field :series_id, type: Integer
  field :action, type: String
  field :actor, type: String
  field :account_id, type: Integer

  validates_presence_of :session_id

end
