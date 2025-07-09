class Video < ApplicationRecord
  # has_one_attached :thumb
  # validates_attachment_content_type :thumb, :content_type => ["image/jpg", "image/jpeg", "image/png", "image/gif", "application/pdf"]
  has_attached_file :thumb, :styles => { :medium => "300x300>", :thumb => "100x100>" },
                    :default_url => "https://s3.amazonaws.com/mayhemdevs//missing.svg",
                    :storage => :s3,
                    :s3_credentials => Proc.new{|a| a.instance.s3_credentials },
                    s3_region: "us-east-1"
  validates_attachment_content_type :thumb, :content_type => ["image/jpg", "image/jpeg", "image/png", "image/gif", "application/pdf"]

  def video_url
    "#{ENV['VIDEO_URL']}/#{self.stream_name}.m3u8"
  end
  def s3_credentials
    {:bucket => ENV['VIDEO_BUCKET'], :access_key_id => ENV['S3_KEY'], :secret_access_key => ENV['S3_SECRET'],credentials: Aws::Credentials.new(ENV['S3_KEY'], ENV['S3_SECRET'])}
  end
  def video_cdn
    "#{ENV['VIDEO_CDN']}/#{self.url}"
  end
  def video_thumb
    self.thumb? ? "#{ENV['VIDEO_CDN']}#{self.thumb.path}" : nil
  end

  def delete_image
    self.thumb = nil
    save
  end
end
