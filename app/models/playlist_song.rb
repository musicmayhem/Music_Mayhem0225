class PlaylistSong < ApplicationRecord
  belongs_to :playlist, touch: true
  belongs_to :song, -> { 
    where(
      "songs.artist IS NOT NULL AND 
       songs.title IS NOT NULL AND 
       songs.active IS TRUE"
    ) 
  }

  # Delegations
  delegate :genres, 
           :title, 
           :artist, 
           :length_in_seconds, 
           :year, 
           :created_at, 
           :updated_at, 
           :path, 
           :direct_url, 
           :direct_url_expires_at, 
           :play_count, 
           :itunes_affiliate_url, 
           :itunes_artwork_url, 
           :active, 
           :before_archive_path, 
           :public_url,
           to: :song,
           allow_nil: true

  # Callbacks
  after_commit :update_playlist_eras, on: [:create, :update, :destroy]

  # Validations
  validates :playlist, presence: true
  validates :song, presence: true
  validates :position, numericality: { only_integer: true, allow_nil: true }

  # Scopes
  scope :ordered, -> { order(position: :asc) }
  scope :active_songs, -> { joins(:song).where(songs: { active: true }) }
  scope :with_complete_info, -> { 
    joins(:song).where(
      "songs.artist IS NOT NULL AND 
       songs.title IS NOT NULL"
    ) 
  }

  private

  def update_playlist_eras
    playlist&.update_eras
  end
end
