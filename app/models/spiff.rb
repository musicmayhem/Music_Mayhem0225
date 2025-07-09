class Spiff < ApplicationRecord
  belongs_to :account
  scope :not_redeemed, -> { where(redeemed_at: nil) }
  scope :order_by_redemption, -> { order(redeemed_at: :desc) }
end
