ActiveAdmin.register_page "Dashboard" do

  menu :priority => 1, :label => proc{ I18n.t("active_admin.dashboard") }

  content :title => proc{ I18n.t("active_admin.dashboard") } do
    
     columns do
       column do
         panel "Songs Played" do
           div class: 'stats count' do
             Song.sum(:play_count)
           end
         end

         panel "Account Count" do
           div class: 'stats count' do
             Account.count
           end
         end
       end

       column do
         panel "Most Common Genre" do
           g = Genre.order(:songs_count).first
           link_to g.name, [:admin, g] if g
         end

         panel "Most Common Era" do
           era = Era.most_popular
           link_to era.name, [:admin, era] if era
         end
       end

       column do
         panel "Connect to Dropbox" do
           div :class => 'dropbox-info' do
             render partial: 'dropbox_info'
           end
         end
         panel "Stripe Sandbox Switch" do
           render partial: 'stripe_sandbox_switch'
         end
        panel "Dropbox Videos" do
           div :class => 'dropbox-video' do
             render partial: 'dropbox_video'
           end
         end
       end
     end
  end
end
