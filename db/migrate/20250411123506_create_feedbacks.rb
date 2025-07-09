class CreateFeedbacks < ActiveRecord::Migration[7.0]
  def change
    create_table :feedbacks do |t|
      t.boolean :did_you_have_fun
      t.boolean :did_everything_work
      t.boolean :contact_me
      t.boolean :any_suggestions_or_ideas
      t.string :comments
      t.references :account
      t.references :player
      t.references :game

      t.timestamps
    end
  end
end