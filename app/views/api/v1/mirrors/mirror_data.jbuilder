json.round_count @round_count
json.players_count @players_count
json.total_songs_count @total_songs_count
json.rounds @rounds
json.already_played_song_ids @already_played_song_ids
json.current_session @current_session
json.songs_url @songs_url
json.game (@game)
json.advertise_images (@advertise_images)
json.advertise_time (@advertise_time)
json.currentProfile (@game.current_profile) if @game
json.series_name(@series_name)
