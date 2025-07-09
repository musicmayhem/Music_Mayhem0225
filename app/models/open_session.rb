class OpenSession < ActiveRecord::Base
  include ApplicationHelper
  has_many :games, foreign_key: :session_id
  scope :active_sessions, -> { where(active: true) }
  scope :inactive_sessions, -> { where(active: false) }
  scope :no_series_attached, -> { where(series_id: nil, active: true).last(10) }
  after_create :add_session_to_series

  def add_session_to_series
    series = Series.where("name LIKE ?", "#{first_half(self.name.parameterize)}%").active_series.last
    if series
      self.update(series_id: series.id)
    end
  end
end
