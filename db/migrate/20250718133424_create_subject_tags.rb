class CreateSubjectTags < ActiveRecord::Migration[7.2]
  def change
    create_table :subject_tags do |t|
      t.string :name
      t.integer :question_count
      t.boolean :active, default: true

    end
  end
end
