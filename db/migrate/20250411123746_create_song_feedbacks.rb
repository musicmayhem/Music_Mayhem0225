class CreateSongFeedbacks < ActiveRecord::Migration[7.0]
  def change
    create_table :song_feedbacks do |t|
      t.timestamps
    end
  end
end
