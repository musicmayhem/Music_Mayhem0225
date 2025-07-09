if @game
  json.game (@game)
  json.songs_url (@songs_url)
  json.round (@rounds)
  json.state (@game.state)
end
