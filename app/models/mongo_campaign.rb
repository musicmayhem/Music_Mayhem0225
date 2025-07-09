class MongoCampaign
  include Mongoid::Document
  include Mongoid::Timestamps

  field :campaign_id, type: Integer
  field :campaign_name, type: String
  field :action, type: String
  field :account_id, type: Integer
  field :actor, type: String

  validates_presence_of :campaign_id

end
