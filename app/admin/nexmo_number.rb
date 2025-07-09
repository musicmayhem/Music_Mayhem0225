ActiveAdmin.register NexmoNumber do
  menu parent: 'Misc'
  
  form do |f|
    f.semantic_errors *f.object.errors.keys
    f.inputs "Nexmo Numbers" do
      f.input :number
    end
    f.actions
  end



  controller do
    def permitted_params
      params.permit(:nexmo_number => [:number])
    end
  end

end
