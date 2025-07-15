class AddTypeToSongs < ActiveRecord::Migration[7.2]
  def change
    add_column :songs, :question_type, :string, default: "song"
  end
end
