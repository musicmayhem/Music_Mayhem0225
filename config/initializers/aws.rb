require 'aws-sdk-s3'

Rails.configuration.aws = YAML.load(
  ERB.new(File.read("#{Rails.root}/config/aws.yml")).result,
  aliases: true
)[Rails.env].symbolize_keys!

Aws.config.update({
  region: 'us-east-1',
  credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY'], ENV['AWS_SECRET_KEY'])
})
