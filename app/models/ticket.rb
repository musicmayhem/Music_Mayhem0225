class Ticket < ApplicationRecord
  belongs_to :account
  validates_presence_of :account_id
  validates_presence_of :session_id
  validates_presence_of :number
end
