class Series < ApplicationRecord
  has_many :score_tables
  has_many :open_sessions
  belongs_to :campaign
  scope :active_series, -> { where(active: true) }
  scope :no_campaign_series, -> { where(campaign_id: nil) }
end
