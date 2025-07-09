class CreateCampaignAssets < ActiveRecord::Migration[7.0]
  def change
    create_table :campaign_assets do |t|
      t.references :campaign
      t.references :asset

      t.timestamps
    end
  end
end