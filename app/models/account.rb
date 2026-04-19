class Account < ApplicationRecord
  include ApplicationHelper
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :invitable, :database_authenticatable, :registerable, :confirmable, :recoverable, :rememberable, :trackable, :validatable,:timeoutable, authentication_keys: [:login]

  has_many :games
  has_many :spiffs
  has_many :playlists
  has_many :charges
  has_many :vouchers
  has_many :referrals
  has_many :logged_in_devices, dependent: :destroy
  has_many :feedbacks
  has_one :subscription, dependent: :destroy
  has_many :players
  has_many :tickets
  has_many :player_song_plays

  after_update :confirmed, if: :saved_change_to_confirmed_at?

  attr_writer :login
  attr_accessor :referral_code,:game_code
  validates_presence_of :username
  validates_uniqueness_of :username
  validates_format_of :username, with: /^[a-zA-Z0-9_\.]*$/, :multiline => true
  validates_format_of :name, with: /^[a-zA-Z0-9_ \.]*$/, :multiline => true

  has_attached_file :logo, :styles => { :medium => "300x300>", :thumb => "100x100>" },
                    :default_url => "https://s3.amazonaws.com/mayhemdevs//missing.svg",
                    :storage => :s3,
                    :s3_credentials => Proc.new{|a| a.instance.s3_credentials },
                    s3_region: "us-east-1"
  validates_attachment_content_type :logo, :content_type => ["image/jpg", "image/jpeg", "image/png", "image/gif", "application/pdf"]


  # has_one_attached :avatar

  # validate :avatar_type

  # def avatar_type
  #   return unless avatar.attached?

  #   acceptable_types = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
  #   unless acceptable_types.include?(avatar.blob.content_type)
  #     errors.add(:avatar, "must be a JPEG, PNG, GIF, or PDF")
  #   end
  # end

  # def avatar_medium_url
  #   avatar.attached? ? avatar.variant(resize_to_limit: [300, 300]).processed.url : default_avatar_url
  # end

  # def avatar_thumb_url
  #   avatar.attached? ? avatar.variant(resize_to_limit: [100, 100]).processed.url : default_avatar_url
  # end

  # def default_avatar_url
  #   ActionController::Base.helpers.asset_path("default_avatar.png")
  # end

  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions.to_hash).where(["lower(username) = :value OR lower(email) = :value", { :value => login.downcase }]).first
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      where(conditions.to_hash).first
    end
  end

  def login
    @login || self.username || self.email
  end

  def rounds_played
    Round.where(game_id: players.pluck(:game_id)).count
  end

  def current_player_rounds_played
    players.last&.game&.rounds&.count
  end

  def serializable_hash(options = nil)
    super(options).merge(confirmed_at: confirmed_at)
  end

  def self.from_omniauth(auth)
    require 'open-uri'

    # Look up by provider-specific ID first so that returning users are
    # always matched correctly, even if they change their email.
    account = case auth.provider
              when 'facebook'     then find_by(fb_id: auth.uid)
              when 'twitter'      then find_by(tw_id: auth.uid)
              when 'google_oauth2' then find_by(g_id: auth.uid)
              end

    # Fall back to email match when we have one and no ID match exists yet.
    if account.nil? && auth.info.email.present?
      account = find_by(email: auth.info.email)
    end

    account ||= new

    account.tap do |user|
      # Store the provider-specific UID so future logins resolve instantly.
      case auth.provider
      when 'facebook'      then user.fb_id = auth.uid.to_s
      when 'twitter'       then user.tw_id = auth.uid.to_s
      when 'google_oauth2' then user.g_id  = auth.uid.to_s
      end

      unless user.persisted?
        user.username = Api::V1::GuestusersController.guest_random_name
        user.password = SecureRandom.hex(16)
        user.name     = auth.info.name.presence || user.username
        # Twitter may not supply an email — use a placeholder so validations pass.
        user.email    = auth.info.email.presence ||
                        "#{user.username}@oauth-noemail.musicmayhem.fake"

        begin
          user.logo = URI.open(auth.info.image) if auth.info.image.present?
        rescue StandardError
          # Avatar download is non-critical — skip silently on failure.
        end

        user.confirmed_at           = DateTime.now
        user.invitation_accepted_at = DateTime.now
      end

      user.save!
    end
  end

  def s3_credentials
    {:bucket => ENV['S3_BUCKET'], :access_key_id => ENV['S3_KEY'], :secret_access_key => ENV['S3_SECRET'],credentials: Aws::Credentials.new(ENV['S3_KEY'], ENV['S3_SECRET'])}
  end

  def block_from_invitation?
    false
  end

  def admin?
    false
  end

  def host?
    role == "host"
  end

  def players_session_id
    players.includes(:game).map { |p| p.game&.session_id }.compact.uniq
  end

  def guesses
    Guess.includes(:song_play, song: [:genres], player: [:game]).where(player_id: players.pluck(:id)).map {|g| [g.song_play.song_id, g.score, g.song.title, g.song.artist, g.song.year, g.song.genres.collect(&:name).join(" | "), g.player.name, g.player.game_id, g.player.game.code, g.song_play.started_at] if (g.song && g.player.game) }.compact
  end

  OTP_LENGTH = 4 
  
  def send_confirmation_instructions
    token = SecureRandom.random_number(10**OTP_LENGTH).to_s.rjust(OTP_LENGTH, "0")
    self.confirmation_token = token
    self.confirmation_sent_at = Time.now.utc
    save(validate: false)
    UserMailer.confirmation_instructions(self, self.confirmation_token).deliver_now
  end

  def games_played
    Player.where(email: self.email).count
  end

  def song_history
    names = guesses.sort_by { |e| e.nil? ? 0 : e.last }.reverse!.uniq {|x| x[0]}.first(100)
  end

  def confirmed
    return nil unless confirmed?

    AddTagToPlayerWorker.perform_async(email, username)
  end

end
