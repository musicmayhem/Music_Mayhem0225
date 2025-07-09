class AddTagToPlayerWorker
  include Sidekiq::Worker
  include ApplicationHelper

  def perform(email,username)
    logger.info "**************************** ADDING TAG TO MAILCHIMP STARTED ****************************"
    list_id = ENV['MAILCHIMP_LIST']
    @gibbon = Gibbon::Request.new
    begin
      subscribe = @gibbon.lists(list_id).members.create(body: { email_address: email, merge_fields:  { :FNAME => username }, status: "subscribed", double_optin: false })
      add_tag_to_player_mailchimp(email, ENV['SEASON']) if email_list.include?(email)
    rescue Gibbon::MailChimpError => e
      logger.info "Guys, we have a problem: #{e}"
    end
    logger.info "**************************** ADDED TAG TO MAILCHIMP ****************************"
  end
end
