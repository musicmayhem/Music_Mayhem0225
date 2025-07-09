class MongoSeries
  include Mongoid::Document
  include Mongoid::Timestamps

  field :series_id, type: Integer
  field :series_name, type: String
  field :campaign_id, type: Integer
  field :action, type: String
  field :actor, type: String
  field :account_id, type: Integer

  validates_presence_of :series_id

end
