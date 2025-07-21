class CreateJoinTableSubjectSrong < ActiveRecord::Migration[7.2]
  def change
    create_table :subject_songs do |t|
      t.references :subject
      t.references :song

    end
  end
end
