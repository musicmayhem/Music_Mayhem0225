class ChangeTitleLength < ActiveRecord::Migration[7.2]
  def up
    change_column :songs, :title, :string, limit: 512
  end

  def down
    # You'd need to specify the original column type here
    change_column :songs, :title, :string, limit: 255
  end
end
