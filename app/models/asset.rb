class Asset < ApplicationRecord
  has_many :campaign_assets
  has_many :campaigns, through: :campaign_assets, :dependent => :destroy


	# has_one_attached :adv_image

	has_attached_file 	:adv_image, :styles => { :medium => "300x300>", :thumb => "100x100>" },
		                :default_url => "/assets/:style/missing.png",
		                :s3_credentials => Proc.new{|a| a.instance.s3_credentials },
		                :storage => :s3

	def s3_credentials
		{:bucket => ENV['S3_BUCKET'], :access_key_id => ENV['S3_KEY'], :secret_access_key => ENV['S3_SECRET']}
	end

	def self.trivia_assets
		Asset.where(trivia_asset: true)
	end
end
