class MongoHost
  include Mongoid::Document
  include Mongoid::Timestamps

  field :account_id, type: Integer
  field :host_name, type: String

  validates_presence_of :account_id

end
