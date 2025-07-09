json.current_account_logo current_account&.logo&.url
json.username current_account&.username
json.total_points @total_points
json.games_won current_account&.games_won
json.avg_points @avg_points
json.played_games @played_games
json.winning_percentage @winning_percentage
json.games_played_count @games_played_count
json.best_genre @best_genre
json.best_era @best_era
json.max_score @max_score
json.muted @muted
era_data = current_account&.user_era
user_era = era_data&.map { |k, v| k if v == 'true' }&.compact
json.userEra user_era
genre_data = current_account&.user_genre
user_genre = genre_data&.map { |k, v| k if v == 'true' }&.compact
json.userGenre user_genre
