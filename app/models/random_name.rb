class RandomName < ApplicationRecord
  validates_presence_of :fake_name
  validates_uniqueness_of :fake_name
end
