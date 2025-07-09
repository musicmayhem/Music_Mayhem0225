class CampaignAsset < ApplicationRecord
  belongs_to :campaign
  belongs_to :asset
  delegate :name , :to => :asset
end
