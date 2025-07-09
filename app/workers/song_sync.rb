require 'open-uri'
require 'mimemagic'

class SongSync
  include Sidekiq::Worker
  sidekiq_options :retry => false # No retries or death

  def perform(admin_id, dir_name)
    logger.info dir_name
    logger.info "==============================================="
    admin = AdminUser.find(admin_id)
    dropbox_client = DropboxApi::Client.new(admin.bearer_token)
    # cursor_obj = dropbox_client.delta(admin.cursor, dir_name)
    cursor_obj = dropbox_client.list_folder(dir_name, :recursive => true, :include_deleted => false) if !admin.cursor.present?
    cursor_obj = dropbox_client.list_folder_continue(admin.cursor) if admin.cursor.present?
    logger.info "**************************** DROPBOX SYNC STARTED ****************************"
    logger.info "---------> Total entries #{cursor_obj.entries.count}"
    cursor_obj.entries.entries.map {|x| x.to_hash}.each_with_index do |dropbox_file, index|
      logger.info "************************** #{index+1}"
      begin
        if dropbox_file['.tag'] == 'file'
          logger.info dropbox_file.to_yaml
          temp_path = dropbox_client.get_temporary_link(dropbox_file['path_lower'])
          encoded_url = URI.encode(temp_path.link)
          is_audio = MimeMagic.by_magic(File.open(open(URI.parse(encoded_url)))).type.include?("audio")
          if is_audio
            logger.info "************* direct_path: #{encoded_url} *************"
            song = Song.where("lower(path) = ?", dropbox_file['path_lower'].to_s.downcase).first_or_initialize(path: dropbox_file['path_lower'])
            if song.new_record?
              logger.info dropbox_file['link'].to_yaml
              song_path = dropbox_file['path_lower']
              logger.info song_path
              logger.info "=================================================="
              song.path = song_path
              song.title = dropbox_file['name']
              song.direct_url = encoded_url
              logger.info "****************** Uploading to S3 *******************"
              s3 = Aws::S3::Resource.new
              file = open(URI.parse(encoded_url))
              bucket = s3.bucket(Rails.configuration.aws[:bucket])
              bucket.object(dropbox_file['name']).upload_file(file.path,{acl: "public-read"})
              song.public_url = bucket.object(dropbox_file['name']).public_url.to_s
              logger.info "********************* Saving New Song ************************"
              song.save!
              file.close
            else
              logger.info "xxxxxxxxx refresh_meta_data xxxxxxxxx"
              song.refresh_meta_data(dropbox_file)
            end
          end
        end
      rescue Exception => e
        logger.info "****************************RESCUE ERROR => #{e} ****************************"
      end
    end
    admin.cursor = cursor_obj.cursor
    admin.dropbox_synced_at = Time.now
    admin.save!
    logger.info "**************************** DROPBOX SYNC FINISHED ****************************"
  end
end
