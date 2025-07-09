class AdminUser < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, 
         :recoverable, :rememberable, :validatable
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, 
         :recoverable, :rememberable, :validatable
  
  def login=(login)
     @login = login
  end

  def login
    @login || self.email
  end

  # def self.find_for_database_authentication(warden_conditions)

  #   conditions = warden_conditions.dup
  #   login = conditions.delete(:login)
  #   where(conditions).where(["lower(email) = :value", { :value => login.strip.downcase }]).first
  # end

  def linked_to_dropbox?
    dropbox_secret_token? && dropbox_access_token? && bearer_token?
  end

  def link_to_dropbox_with_access_token(access_token)
    self.bearer_token = access_token
    save
  end

  def remember_me!
    self.remember_token ||= self.class.remember_token if respond_to?(:remember_token)
    self.remember_created_at ||= Time.now.utc
    save(validate: false) if self.changed?
  end

  def dropbox_client
    @client ||= DropboxApi::Client.new(self.bearer_token)
  end

  def dropbox_sync!
    begin
      if dropbox_client.list_folder(ENV['DROPBOX_DIR']).entries.any?
        SongSync.perform_async(self.id, ENV['DROPBOX_DIR'])
      end
    rescue Exception => e
      puts e.message
    end
  end

  def sync_directory(dir_name)
    cursor_obj = dropbox_client.delta(self.cursor, dir_name)
    cursor_obj.entries.each do |obj|
      sync_file(obj) unless obj.is_dir?
    end
    self.cursor = cursor_obj.cursor
    self.dropbox_synced_at = Time.now
    save!
  end

  def sync_file(obj)
    find_or_create_song_from_dropbox_file(obj)
  end

  def is_audio?(obj)
    !((obj.mime_type =~ /audio/).nil?)
  end

  def find_or_create_song_from_dropbox_file(dropbox_file)
    song = Song.where("lower(path) = ?", dropbox_file.path.to_s.downcase).first_or_initialize(path: dropbox_file.path)
    if dropbox_file.is_deleted?
      song.destroy!
    elsif song.new_record?
      song.path = dropbox_file.path
      song.title = song.file_name
      song.direct_url_attributes = dropbox_file.direct_url
      song.save
    else
      song.refresh_meta_data(dropbox_file)
    end if is_audio?(dropbox_file)
  end

  def video_sync!
    begin
      logger.info ENV['DROPBOX_VIDEO_DIR']
      if dropbox_client.list_folder(ENV['DROPBOX_VIDEO_DIR']).entries.any?
        VideoSync.perform_async(self.id, ENV['DROPBOX_VIDEO_DIR'])
      end
    rescue Exception => e
      puts e.message
    end
  end


end
