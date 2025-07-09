if params[:issue] && params[:song_id]
  game = Game.find_by_code(params[:code])
  song_feedback = SongFeedback.new(song_id: params[:song_id], created_by: 'host',game_id: game.id,name: current_account&.name, issue: params[:issue])
  if song_feedback.save!
    json.feedback (song_feedback)
  end
end
