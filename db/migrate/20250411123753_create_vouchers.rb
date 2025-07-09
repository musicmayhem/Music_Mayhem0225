class CreateVouchers < ActiveRecord::Migration[7.0]
  def change
    create_table :vouchers do |t|
      t.timestamps
    end
  end
end
