ActiveAdmin.register RandomName do
  menu parent: 'Account Management'
  
  @first_list = []
  @second_list = []
  @third_list = []

  active_admin_importable do |model, hash|
    @first_list << hash[:first_list]
    @second_list << hash[:second_list]
    @third_list << hash[:third_list]
    active_admin_importable.list(@first_list, @second_list, @third_list)
  end

  controller do
    after_action :create_combination, only: [:import_csv]

    class_variable_set(:@@first_list, [])
    class_variable_set(:@@second_list, [])
    class_variable_set(:@@third_list, [])

    def self.list(value1,value2,value3)
      @@first_list = value1.reject(&:blank?)
      @@second_list = value2.reject(&:blank?)
      @@third_list = value3.reject(&:blank?)
    end

    def create_combination
      @@first_list.each do |f|
        @@second_list.each do |s|
          @@third_list.each do |t|
            combined = f+s+t
            RandomName.create(fake_name: combined)
          end
        end
      end
    end
  end
  
end