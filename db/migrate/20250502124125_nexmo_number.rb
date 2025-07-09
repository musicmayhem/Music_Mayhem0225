class NexmoNumber < ActiveRecord::Migration[7.2]
  def change
    create_table :nexmo_numbers, id: :serial do |t|
      t.string :number, limit: 255
      t.datetime :created_at, precision: nil
      t.datetime :updated_at, precision: nil
    end
  end
end
