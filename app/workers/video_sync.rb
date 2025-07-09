
class VideoSync
  include Sidekiq::Worker
  sidekiq_options :retry => false # No retries or death


  def perform(admin_id, dir_name)
    logger.info dir_name
    logger.info "==============================================="
    admin = AdminUser.find(admin_id)
    dropbox_client = DropboxApi::Client.new(admin.bearer_token)
    # cursor_obj = dropbox_client.delta(admin.cursor, dir_name)
    cursor_obj = dropbox_client.list_folder(dir_name, :recursive => true, :include_deleted => false) if !admin.video_cursor.present?
    cursor_obj = dropbox_client.list_folder_continue(admin.video_cursor) if admin.video_cursor.present?
    logger.info "**************************** DROPBOX SYNC STARTED ****************************"
    logger.info "---------> Total entries #{cursor_obj.entries.count}"
    cursor_obj.entries.entries.map {|x| x.to_hash}.each_with_index do |dropbox_file, index|
      logger.info "************************** #{index+1}"
      begin
        if dropbox_file['.tag'] == 'file'
          logger.info dropbox_file.to_yaml
          temp_path = dropbox_client.get_temporary_link(dropbox_file['path_lower'])
          encoded_url = URI.encode(temp_path.link)
          logger.info "*********** #{encoded_url}"
          logger.info "*********** #{dropbox_file["name"]}"
          video = Video.where("lower(path) = ?", dropbox_file['path_lower'].to_s.downcase).first_or_initialize(path: dropbox_file['path_lower'])
          if video.new_record?
            logger.info dropbox_file['link'].to_yaml
            video_path = dropbox_file['path_lower']
            logger.info video_path
            logger.info "=================================================="
            video.path = video_path
            video.url = dropbox_file['name']
            video.title = dropbox_file['name']
            # video.direct_url = encoded_url
            logger.info "****************** Uploading to S3 *******************"
            logger.info Rails.configuration.aws[:bucket]
            s3 = Aws::S3::Resource.new
            file = open(URI.parse(encoded_url))
            bucket = s3.bucket(ENV['VIDEO_BUCKET'])
            bucket.object(dropbox_file['name']).upload_file(file.path,{acl: "public-read"})
            # video.public_url = bucket.object(dropbox_file['name']).public_url.to_s
            logger.info "********************* Saving New video ************************"
            video.save!
            file.close
          else
            logger.info "xxxxxxxxx refresh_meta_data xxxxxxxxx"
           end
        end    
      end
    end
    admin.video_cursor = cursor_obj.cursor
    admin.video_sync_time = Time.now
    admin.save!
    logger.info "**************************** DROPBOX SYNC FINISHED ****************************"
  end
end


