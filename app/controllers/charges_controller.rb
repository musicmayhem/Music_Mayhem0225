class ChargesController < ApplicationController

  before_action :check_params, :except => [:stripe_sandbox_switch]
  before_action :check_admin, :only => [:stripe_sandbox_switch]

  def stripe_sandbox_switch
    if AdminUser.first.enabled_stripe_test
      AdminUser.first.update_attribute :enabled_stripe_test, false
      Rails.configuration.stripe = {
        :publishable_key => ENV['PUBLISHABLE_KEY'],
        :secret_key      => ENV['SECRET_KEY']
      }
    else
      AdminUser.first.update_attribute :enabled_stripe_test, true
      Rails.configuration.stripe = {
        :publishable_key => ENV['PUBLISHABLE_KEY_TEST'],
        :secret_key      => ENV['SECRET_KEY_TEST']
      }
    end
    flash[:notice] = "Stripe sandbox switched successfully"
    redirect_to '/admin'
  end

  protected

  def check_params
    unless current_account
      redirect_to accounts_step_one_path
    end
  end

  def check_admin
    unless current_admin_user
      redirect_to '/admin/login'
    end
  end
  
end
