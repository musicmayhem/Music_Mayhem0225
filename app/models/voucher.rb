class Voucher < ApplicationRecord
  belongs_to :account
  has_many :referrals

  validates_presence_of :account_id
  validates_presence_of :amount
  validates_presence_of :code
  validates_uniqueness_of :code

  def new?
    access == "New" || access == "All"
  end

  def old?
    access == "Old" || access == "All"
  end
end
