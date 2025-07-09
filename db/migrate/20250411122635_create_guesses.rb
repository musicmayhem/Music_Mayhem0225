class CreateGuesses < ActiveRecord::Migration[7.0]
  def change
    create_table :guesses do |t|
      t.references :song_play
      t.references :player
      t.integer :artist_score, default: 0
      t.integer :title_score, default: 0
      t.string :artist
      t.string :title
      t.references :round
      t.references :account
      t.integer :additional_points, default: 0
      t.float :seconds_title_answer
      t.float :seconds_artist_answer
      t.integer :year_score, default: 0
      t.float :seconds_year_answer
      t.string :year
    end
  end
end