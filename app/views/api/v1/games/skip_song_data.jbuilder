game = Game.find_by_code(params[:game][:code])
songs = []
if game&.current_round&.playlist&.songs
  if ['Active Song','Showing LeaderBoard','Song Ended','Review Playlist','Set Current Round','Starting Game'].include? game.state
    current_round = game.current_round
    already_played_song_ids = game.already_played_song_ids.map(&:to_s)
    old_song_ids = current_round.song_order_ids.map(&:to_i)
    settings = current_round.settings
    if settings['eras'] && settings['genres']
      playlist_songs = current_round.playlist.get_filtered_songs(eval(settings['eras']), eval(settings['genres'])).map(&:to_s)
    else
      playlist_songs = current_round.playlist.songs.pluck(:id)&.map(&:to_s)
    end
    current_round_songs = current_round.song_order_ids
    current_game_songs = current_round_songs + already_played_song_ids
    if game.random_play
      new_song = (playlist_songs - current_game_songs).sample
    else
      new_song = params[:game][:song_skip_count] ? (playlist_songs - current_game_songs)[params[:game][:song_skip_count]] : (playlist_songs - current_game_songs).first
    end
    Pusher["games_#{game.id}"].trigger('game_event', type: 'last_10_songs', remaining_song_count: 0 ) if params[:songId] && new_song.nil?
    if params[:songId] && ( game.state == 'Active Song' || game.state == 'Review Playlist' || game.state == 'Set Current Round' || game.state == 'Starting Game') && new_song
      old_song_ids << new_song if old_song_ids.delete(params[:songId])
      Pusher["games_#{game.id}"].trigger('game_event', type: "skip_selected_song") if !(game.state == 'Review Playlist' || game.state == 'Set Current Round' || game.state == 'Starting Game')
      current_round.update(song_order_ids: old_song_ids,song_ids: old_song_ids)
    end
    (old_song_ids - game.already_played_song_ids).each do |song_ids|
      s = Song.find(song_ids)
      s = s.attributes.merge({issues: s.song_feedbacks.pluck(:issue).last, additional_data: s.additional_data })
      songs << s
     end
    json.songsList (current_round.song_order_ids - already_played_song_ids)
    json.roundData (current_round)
    json.songsData (songs)
    json.totalSongCount (game.song_countz)
    json.currentSongCount (game.song_of_songs_count)
    json.songCount(game.not_skipped_song.count)
  end
end
