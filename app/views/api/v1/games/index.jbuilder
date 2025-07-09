#To Play Games

json.player_history(@player_history) do |player_history|
  json.merge! player_history.attributes
end
json.campaign(@campaign) do |campaign|
  json.campaign campaign
end
json.games(@games) do |game|
  json.merge! game.attributes
end
json.current_games(@current_games) do |current_games|
  json.merge! current_games.attributes
end

json.percent (@percent)
json.current_account (@current_account)
json.current_account_logo (@current_account_logo)
if current_account
  json.username (current_account.username)
  json.games_won (current_account.games_won)
end
json.plan (@plan)
json.profile (@profile)
json.played_games (@played_games)
json.games_played_count (@games_played_count)
json.best_era (@best_era)
json.best_genre (@best_genre)
json.winning_percentage (@winning_percentage)
json.max_score (@max_score)

#metrics
json.total_songs (@total_songs)
json.total_points (@total_points)
json.avg_points (@avg_points)

#game_section
json.current_games_section (@current_games_section)
json.game_id (@game_id)

#generate_playlist
json.playlists (@playlists)
