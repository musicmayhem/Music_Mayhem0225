class Campaign < ApplicationRecord
  has_many :campaign_assets
  has_many :series
  has_many :assets, through: :campaign_assets, dependent: :destroy
  belongs_to :playlist, optional: true
end
