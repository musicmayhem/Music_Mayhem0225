class Game < ApplicationRecord
  include ApplicationHelper
#   TODO
  serialize :prev_games_ids, coder: YAML
  SONG_PLAY_TIME_OPTIONS = [30, 60, 90, 120]
  SONG_COUNT_OPTIONS = [10, 20, 30, 40, 50]
  GAME_MODE_OPTIONS = [["Multi-Player", "multi"], ["Juke-Box-Auto", "jukeauto"], ["None - Passive Play", "none"], ["Single Player", "single"]]

  has_many :players
  has_many :song_plays
  has_many :rounds
  has_many :feedbacks
  has_many :open_sessions
  has_many :player_answers

  has_many :game_constraints, dependent: :destroy
  has_many :genre_constraints, through: :game_constraints, source: :constraint, source_type: "Genre"
  has_many :era_constraints, through: :game_constraints, source: :constraint, source_type: "Era"

  accepts_nested_attributes_for :game_constraints

  belongs_to :account
  belongs_to :current_profile, foreign_key: :profile_id, class_name: 'GameProfile'
  belongs_to :loaded_song, class_name: "Song", optional: true
  belongs_to :current_song, class_name: 'SongPlay', optional: true
  belongs_to :current_round, class_name: 'Round', optional: true
  belongs_to :campaign, optional: true

  validates_presence_of :account_id
  validates_presence_of :code
  validates_uniqueness_of :code

  after_initialize :set_defaults
  before_validation :set_code

  after_save :notify_subscribers, if: :saved_change_to_state?
  before_save :check_for_manual_control_change, :clear_cache
  after_create :build_round , :update_player_limit
  attr_accessor :genre_id, :era_id, :playlist_id, :song_count, :solo_game,:profile, :enable_remote, :players_limit

  accepts_nested_attributes_for :rounds, :allow_destroy => true

  scope :last_ten_games, -> {where('state != ?', 'Game Over').order('created_at DESC').limit(10)}
  scope :in_progress, -> { where.not(state: 'Game Over') }
  scope :non_temp, -> { joins(:account).where('accounts.temp_account != ?', true) }
  scope :no_session_game, -> { where(session_id: nil).last(10)  }


  INACTIVE_STATES = [
    "Ready to Play",
    "Game Over"
  ].freeze

  ACTIVE_STATES = [
    "Remote start game",
    "Set Current Round",
    "Play Intro",
    "Play Outro",
    "Pause Game",
    "Resume Game",
    "Next Song",
    "Next Round",
    "Display Contestants",
    "Starting Game",
    "Playing Intro",
    "Playing Song",
    "Song Loaded",
    "Song Ended",
    "Showing LeaderBoard",
    "Playing Outro",
    "Active Song",
    "Skip Song" ,
    "Start Timer",
    "Game Updated"
  ]

  def mode
    return "none" if self.passive_mode || self.game_mode == "none"
    return "single" if !self.passive_mode && self.game_mode == "single"
    return "jukeauto" if self.game_mode == "jukeauto"
    return "multi"
  end

  def set_defaults
    self.state ||= "Ready to Play"
  end

  def active?
    return ACTIVE_STATES.include? self.state
  end

  def attributes
    super.merge({'song_of_songs_count' => song_of_songs_count, 'mode' => mode,'current_song_count' => current_song_count})
  end

  def current_session
    OpenSession.find_by_id(session_id) if session_id
  end

  def current_round
    current_round_id ||= rounds.last.id
    Round.find_by_id current_round_id
  end

  def leaderboard
    players.sort {|x,y| y.total_score <=> x.total_score }
  end

  def check_for_manual_control_change
    if (state_changed? && state == "Manual Control")
      manual_control = !manual_control
    end
  end

  def round_wise_score
    round_scores(self.rounds.pluck(:id).sort, self.reset_round )
  end

  def current_round_score
    round_scores(self.rounds.pluck(:id).sort, self.current_round_id )&.sort {|x,y| y["total_score"] <=> x["total_score"]}
  end

  def round_already_played_song_ids
    song_plays.where(round_id: current_round_id).map(&:song_id).uniq
  end

  def reveal_sequence
    if loaded_song
      song_title_string = loaded_song&.title
      song_artist_string = loaded_song&.artist
      artist_length = song_artist_string.gsub(/[ \.,\-\&\#\(\)\]\[@]/i, '').length
      title_length = song_title_string.gsub(/[ \.,\-\&\#\(\)\]\[@]/i, '').length
      new_title_length = 0
      new_artist_length = 0
      total_length = artist_length + title_length
      if ((total_length) > 75)
        ratio = title_length/total_length.to_f
        new_title_length = (ratio * 75).to_i
        new_artist_length = (75 - new_title_length).to_i
        title_array = (1..new_title_length).to_a
        artist_array = (1..new_artist_length).to_a
        title = title_array.shuffle
        artist = artist_array.shuffle
        array = {}
        array.merge(title: title,artist: artist)
      else
        title_array = (1..title_length).to_a
        artist_array = (1..artist_length).to_a
        title = title_array.shuffle
        artist = artist_array.shuffle
        array = {}
        array.merge(title: title,artist: artist)
      end
    end
  end

  def clear_cache
    Rails.cache.delete "game_#{id}"
  end

  def notify_subscribers
    if manual_control_changed?
      Pusher["games_#{id}"].trigger('game_event', { type: "manual_control", data: as_json })
    end
      case state
      when "Set Current Round"
        Pusher["games_#{id}"].trigger('game_event', { type: "set_current_round", data: current_round.as_json })

      #Remote Commands
      when "Remote start game"
        Pusher["games_#{id}"].trigger('game_event', { type: "remote_start_game", data: as_json })

      when "Play Intro"
        Pusher["games_#{id}"].trigger('game_event', { type: "play_intro", data: as_json })

      when "Play Outro"
        Pusher["games_#{id}"].trigger('game_event', { type: "play_outro", data: as_json })

      when "Pause Game"
        self.current_song.pause unless self.current_song.nil?
        Pusher["games_#{id}"].trigger('game_event', { type: "game_paused", data: as_json })

      when "Resume Game"
        self.current_song.resume unless self.current_song.nil?
        Pusher["games_#{id}"].trigger('game_event', { type: "game_resumed", data: as_json })

      when "Next Song"
        Pusher["games_#{id}"].trigger('game_event', { type: "next_song", data: as_json })

      when "Next Round"
        Pusher["games_#{id}"].trigger('game_event', { type: "next_round", data: as_json })

      when "Display Contestants"
        Pusher["games_#{id}"].trigger('game_event', { type: "display_contestants", data: as_json })

      #Game State Updates
      when "Starting Game"
        Pusher["games_#{id}"].trigger('game_event', { type: "game_starting", data: as_json })

      when "Playing Intro"
        Pusher["games_#{id}"].trigger('game_event', { type: "playing_intro", data: as_json })

      when "Skip Song"
        Pusher["games_#{id}"].trigger('game_event', { type: "skip_song", data: {loaded_song: loaded_song.as_json, reveal_seq_array: reveal_sequence.as_json}  })

      when "Playing Song"
        Pusher["games_#{id}"].trigger('game_event', { type: "playing_song", data: as_json.merge(current_song: current_song_count, reveal_seq_array: reveal_sequence.as_json) })

      when "Active Song"
        Pusher["games_#{id}"].trigger('game_event', { type: "active_song", data: as_json, song_count: song_of_songs_count })

      when "Song Loaded"
        Pusher["games_#{id}"].trigger('game_event', { type: "song_loaded", data: {setting: current_round.settings,game: as_json, loaded_song: loaded_song.as_json, reveal_seq_array: reveal_sequence.as_json,song_of_songs_count: current_song_count } })

      when "Song Ended"
        Pusher["games_#{id}"].trigger('game_event', { type: "song_ended", data: current_song.song.attributes.merge({'song_of_songs_count'=>song_of_songs_count, 'code'=>code}) })

      when "Showing LeaderBoard"
        song_winners = players.sort {|x,y| y.current_song_score <=> x.current_song_score }.as_json(methods: :current_song_score )
        round_wise_scores =  round_wise_score ? round_wise_score.sort {|x,y| y["total_score"] <=> x["total_score"]}.take(5) : round_wise_score
        round_winners = current_round_score
        game_winners = leaderboard.as_json(methods: %i[total_score])
        create_mongo_song_play(song_winners, round_winners, game_winners)
        song_winners_tie = []
        song_max = song_winners[0] ? song_winners[0]['current_song_score'] : 0
        song_winners.each do |sw|
          song_winners_tie.push(sw) if(sw['current_song_score'] == song_max)
        end
        Pusher["games_#{id}"].trigger('game_event', { type: "score_tied", data: {players: song_winners_tie, status: 'Song'}  }) if song_winners_tie.length > 1
        score11 = song_winners.select {|x| [11, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 101, 121, 131, 141, 151, 161, 171, 181, 191].include? x["current_song_score"] }
        if self.open_session
          score11.each do |i|
            i['current_song_score'] == 111 ? give_song_winner_ticket(i, 11, 'score111', nil) : give_song_winner_ticket(i, 1, 'score11', nil)
          end
          song_winners_tie.each do |song_winner|
           give_song_winner_ticket(song_winner, 1, 'song' , 1)
          end
          give_song_winner_ticket(song_winners[10], 1, 'song' , 11) if song_winners[10]
          if not_skipped_song.count == song_countz
            round_winners_tie = []
            round_max = round_winners[0] ? round_winners[0]['total_score'] : 0
            round_winners.each do |rw|
              round_winners_tie.push(rw) if(rw['total_score'] == round_max)
            end
            Pusher["games_#{id}"].trigger('game_event', { type: "score_tied", data: {players: round_winners_tie, status: 'Round'}  }) if round_winners_tie.length > 1
            round_winners_tie.each do |round_winner|
              give_song_winner_ticket(round_winner, 2, 'round', 1)
            end
            (1..4).each do |i|
              give_song_winner_ticket(round_winners[i], 1, 'round', i + 1) if round_winners[i] && !round_winners_tie.include?(round_winners[i])
            end
          end
          Pusher["games_#{id}"].trigger('game_event', { type: "showing_leaderboard", data: {loaded_song: loaded_song,song_of_songs_count: song_of_songs_count, game: as_json, leaderboard: round_winners.delete_if { |h| h["total_score"] == 0 },roundScores: round_wise_scores, currentSongScores: song_winners.take(5), player1: song_winners[0], player11: song_winners[10] }.as_json })
        else
          Pusher["games_#{id}"].trigger('game_event', { type: "showing_leaderboard", data: {loaded_song: loaded_song,song_of_songs_count: song_of_songs_count, game: as_json, leaderboard: leaderboard.as_json(methods: :total_score ).delete_if { |h| h["total_score"] == 0 },roundScores: round_wise_scores, currentSongScores: song_winners.take(5) }.as_json })
        end

      when "Playing Outro"
        Pusher["games_#{id}"].trigger('game_event', { type: "playing_outro", data: as_json })

      when "Start Timer"
        Pusher["games_#{id}"].trigger('game_event', { type: "start_timer", data: as_json })

      when "Play Background Music"
        Pusher["games_#{id}"].trigger('game_event', { type: "play_background_music", data: as_json })

      when "New Round Added"
        Pusher["games_#{id}"].trigger('game_event', { type: "new_round_added", data: as_json })

      when "Game Over"
        if self.open_session && session_id
          Pusher["games_#{id}"].trigger('game_event', { type: "game_ended", data: {settings: current_round.settings,game: as_json, leaderboard: self.game_session_score.take(10)}.as_json })
        else
          Pusher["games_#{id}"].trigger('game_event', { type: "game_ended", data: {settings: current_round.settings,game: as_json, leaderboard: leaderboard.as_json(methods: [:total_score, :logo] ).take(5)}.as_json })
        end

      when "Show Ad Camp"
        Pusher["games_#{id}"].trigger('game_event', { type: "show_ad_camp", data: as_json.merge(assets_url: adv_url_and_type, show_adv_on_start: show_adv_on_start, adv_duration: adv_duration, show_adv_between_songs: show_adv_between_songs) })
      end
  end

  def give_song_winner_ticket(winner, ticket_count, status , position)
    if winner
      session = OpenSession.find_by_id(session_id)
      if session
        number = session.last_ticket
        count = ticket_count
        while(count > 0)
         number += 1
         Ticket.create(account_id: winner["account_id"],session_id: session_id,number: number)
         count -= 1
        end
        session.update(last_ticket: number)
        Pusher["games_#{id}"].trigger('game_event', type: 'rewards_updated', reward: 'ticket', account_id: winner["account_id"], auto_ticket: { ticket_count: ticket_count, status: status, position: position })
      end
    end
  end

  def title
    @title = rounds.first.playlist.try(:name) || "All Songs"
  end

  def played_songs
    Song.find already_played_song_ids.uniq
  end

  def already_played_song_ids
    song_plays.map(&:song_id).uniq
  end

  def game_session_score
    session_winner = nil
    max_score = 0
    session_hash = {}
    os = OpenSession.find(session_id)
    return nil unless os

    session_hash[os.name] = {}
    os.games.each do |g|
      session_hash[os.name][g.id] = {}
      g.players.each do |p|
        session_hash[os.name][g.id][p.name] = p.total_score
        if p.total_score > max_score
          max_score = p.total_score
          session_winner = p.account_id
        end
      end
    end
    session_hash = session_hash.values.compact[0]
    data = session_hash.values.compact.inject{ |memo, el| memo&.merge(el){ |k, old_v, new_v| old_v + new_v}}
    [data.sort_by{ |_name, score| -score},session_winner]
  end

  def advertise_images
    advimg_url = []
    unless campaign_id.nil?
      Campaign.find(campaign_id).assets.each do |asset|
        advimg_url << asset.adv_image.url
      end
    end
    return advimg_url
  end

  def adv_url_and_type
    url = 0
    if campaign_assets_url.compact.length > 0
      url = campaign_assets_url
    end

    return url
  end

  def campaign_assets_url
    on_start = []
    during_game = []
    unless campaign_id.nil?
      Campaign.find(campaign_id)&.assets.each do |asset|
        on_start << asset.iframe_url if asset.show_on_start
        during_game << asset.iframe_url if asset.show_during_game
      end
    end
    return on_start, during_game
  end

  def show_adv_on_start
    unless campaign_id.nil?
      Campaign.find(campaign_id).show_on_start
    end
  end

  def show_adv_between_songs
    unless campaign_id.nil?
      Campaign.find(campaign_id).show_between_songs
    end
  end

  def adv_duration
    unless campaign_id.nil?
      Campaign.find(campaign_id).duration
    end
  end

  def song_of_songs_count
    not_skipped_song.count.zero? ? "Song 1 / #{song_countz}" : "Song #{not_skipped_song.count} / #{song_countz}"
  end

  def not_skipped_song
    song_plays.where(skip_song: false)
  end

  def current_song_count
    "Song #{not_skipped_song.count + 1} / #{song_countz}"
  end

  def song_countz
    rounds.inject(0){|sum,r| sum += ( (!r.settings['trivia'] && !r.settings['mayhem_mates']) ? r.song_count.to_i : 0 || Round::DEFAULT_SONG_COUNT) }
  end

  def to_param
    self.code
  end

  def short_url
    [SHORT_DOMAIN, 'g', code].join('/')
  end

  def create_round
    p "===================++++++++<<<<<<<<<<<"
    p self.rounds.last
    last_round = self.rounds.last
    rounds.create(
      genre_ids: self.genre_constraints.pluck(:id),
      era_ids: self.era_constraints.pluck(:id),
      playlist_id: last_round.playlist_id,
      song_count: last_round.song_count,
      campaign_id: last_round.campaign_id,
      adv_duration: last_round.adv_duration,
      guess_timer: last_round.guess_timer,
      song_play_time: last_round.song_play_time,
      point_value: last_round.point_value,
      game_over_display_time: last_round.game_over_display_time,
      leaderboard_display_time: last_round.leaderboard_display_time,
      background_music_playlist: last_round.background_music_playlist || '0'
    ).id
  end

  private

  def round_scores(array, index)
    return unless index

    song_play_id = song_plays.where(skip_song: true).pluck(:id)
    array.shift(array.find_index(index))
    players.map { |player|
      {
        'id' => player.id,
        'game_id' => id,
        'name' => player.name,
        'email' => player.email,
        'account_id' => player.account_id,
        'total_score' => player.additional_points + player.guesses.where(
          round_id: current_round_id
        ).where.not(song_play_id: song_play_id).map(&:score).sum
      }
    }
  end

  def create_mongo_song_play(song_winners, round_winners, game_winners)
    round_winners.each_with_index do |x,index|
      MongoSongPlay.create(song_play_id: current_song_id, player_id: x['id'], account_id: x['account_id'], game_id: id, round_id: current_round_id, round_rank: index + 1, song_rank: song_winners.index {|h| h['id'] == x['id'] } + 1, game_rank: game_winners.index {|h| h['id'] == x['id'] } + 1)
    end
  end

  def set_code
    self.code = rand(36**6).to_s(36).upcase if self.code.blank? && (self.name == "demo" || self.name == "solo")
    if self.code.blank?
      begin
        self.code = loop do
          code = generate_random_code
          break code unless code.to_i > 99 || check_code(code)
        end
      end while self.class.exists?(:code => code)
    end
  end

  def generate_random_code
    (0...3).map{65.+(rand(25)).chr}.join
  end

  def build_round
    rounds.create(
      genre_ids: self.genre_constraints.pluck(:id),
      era_ids: self.era_constraints.pluck(:id),
      playlist_id: ENV['DEFAULT_PLAYLIST_ID'] || playlist_id,
      song_count: self.song_count,
      campaign_id: campaign_id,
      adv_duration: self.adv_duration
    ) if rounds.blank?
  end

  def update_player_limit
    self.update(player_limit: ENV['PLAYER_LIMIT'] || 25)
  end

  def channel
    "games_#{id}"
  end

  def check_code(code)
    str = "ILO10"
    str.split('').each do |char|
      if code.include?(char)
        return true
      end
    end
    false
  end

end
