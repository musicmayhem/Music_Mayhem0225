class EnablePostgresqlExtensions < ActiveRecord::Migration[7.0]
  def change
    enable_extension "hstore"
    enable_extension "plpgsql"
  end
end
