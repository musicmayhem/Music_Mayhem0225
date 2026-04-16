class AddDisplayFlagsToGames < ActiveRecord::Migration[7.2]
  def change
    add_column :games, :pause_game_screen, :boolean, default: false, null: false
    add_column :games, :no_leader_board, :boolean, default: false, null: false
    add_column :games, :display_song_count, :boolean, default: true, null: false
  end
end
