class CreatePlayerAnswers < ActiveRecord::Migration[7.0]
  def change
    create_table :player_answers do |t|
      t.references :player
      t.references :game
      t.string :answer
      t.string :p_name
      t.references :round
      t.integer :question_number

      t.timestamps
    end
  end
end