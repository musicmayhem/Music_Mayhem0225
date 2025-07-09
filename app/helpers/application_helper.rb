module ApplicationHelper
  def plans
    [['Personal-Monthly $2 per month', 'mmpersonal1'], ['Personal - Annual $19.99 per year', 'MMPersonal2'], ['Organization - Monthly $200 per year', 'MMOrg1'], ['Organization - Annual $19,999 per year', 'MMOrg2'], ['One time Party plan, $20 (24 hours)', 'party']]
  end

  def bcg_music_url
    [
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-downtown.mp3',
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-erf.mp3',
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-hipjazz.mp3',
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-endlessmotion.mp3',
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-actionable.mp3',
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-dubstep.mp3',
      'https://s3.amazonaws.com/mayhemsongs1/backgrounds/bensound-groovyhiphop.mp3'
    ].shuffle
  end

  def add_tag_to_player_mailchimp(email,tag_name)
      list_id = ENV['MAILCHIMP_LIST']
      gibbon = Gibbon::Request.new(api_key: ENV['MAILCHIMP_API'])
      p "tags created========> #{tag_name}"
      gibbon.lists(list_id).members(Digest::MD5.hexdigest(email)).tags.create(
        body: {
          tags: [{name: tag_name, status:"active"}]
        }
      )
  end

  def game_winner_reward(account_id,game)
    Spiff.create(account_id: account_id, name: game.winner_spiff || "Game Winner", awarded_at:  DateTime.now.strftime('%B %d, %Y'))
    Pusher["games_#{game.id}"].trigger('game_event', type: 'game_winner', data: { account_id: account_id } )
  end

  def email_list
    e_list = []
    export = Gibbon::Export.new(api_key: ENV['MAILCHIMP_API'])
    export.list(id: ENV['MAILCHIMP_LIST']) do |row|
      e_list << row[0]
    end
    e_list
  end

  def add_camp_tag_to_players(game)
    campaign = game&.campaign&.title
    return nil unless campaign

    game.players.each do |player|
      add_tag_to_player_mailchimp(player.email, campaign) if player.account&.confirmed? && email_list.include?(player.email)
    end
  end

  def first_half(string)
    string[0, (string.size / 3.to_f).ceil]
  end

  def update_player_song_play(game,song_id)
    game.players.includes(:account).each do |p|
      player_song_play = PlayerSongPlay.find_or_initialize_by(player_id: p.id, song_id: song_id,account_id: p.account_id)
      p.account.increment!(:songs_played)
      player_song_play.save!
    end
  end

  def update_additional_points(game)
    round_id = game.current_round.id.to_s
    game.players.includes(:account).each do |p|
      additional_round_points = p.additional_round_points
      additional_round_points[round_id] = p.additional_points + p.guesses.where(round_id: round_id).map(&:additional_points).sum
      p.update(additional_points: 0, additional_round_points: additional_round_points, mayhem_mates_word: nil)
    end
  end

  def match_string(pattern, search, prev_search = nil)
    percentage = clean(pattern).levenshtein_similar(clean(search))
    prev_percentage = clean(pattern).levenshtein_similar(clean(prev_search)) rescue 0
    percentage > 0.75  && percentage >= prev_percentage
  end

  def clean(string)
    string.downcase.strip.gsub(/[^\w]/, "")
  end

end
