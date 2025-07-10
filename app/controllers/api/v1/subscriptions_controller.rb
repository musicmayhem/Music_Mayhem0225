module Api
  module V1
    class SubscriptionsController < ApplicationController
    #   before_filter :check_user, :except => [:stripe_web_hooks]
    #   skip_before_filter :verify_authenticity_token, :only => [:stripe_web_hooks]
    #   respond_to :json
    #   swagger_controller :subscriptions, 'Subscriptions'
#
#       swagger_api :create do
#         summary 'Plann Subscriptions'
#         param :query, :subscription_stripe_card_token, :string, :required, "Subscription card token"
#         param :query, :plan, :string, :optional, "Plan"
#         response :unauthorized
#         response :not_acceptable
#         response :requested_range_not_satisfiable
#       end
#
#       def create
#         params[:subscription_stripe_card_token]
#         params[:plan]
#         unless params[:plan]=='party'
#           if current_account.subscription.blank?
#             if current_account.customer_token.blank?
#               customer = Stripe::Customer.create(
#                 email: current_account.email,
#                 card:  params[:subscription_stripe_card_token]
#               )
#               create_subscription(customer.id, params[:plan])
#               current_account.update_attribute :customer_token, customer.id
#             else
#               create_subscription(current_account.customer_token, params[:plan])
#             end
#           else
#             customer = current_account.customer_token
#             if params[:plan] == current_account.subscription.plan_id
#               flash[:error] = "Already on the same plan"
#             else
#               subscription = Stripe::Subscription.retrieve(current_account.subscription.subscription_id)
#               subscription.plan = params[:plan]
#               if subscription.save
#                 current_account.subscription.destroy
#                 Subscription.new.generate(customer, subscription, current_account)
#                 flash[:success] = "Successfully changed the plan to " + subscription.plan.name
#               end
#             end
#           end
#         else
#           if current_account.charges.blank?
#             if current_account.customer_token.present?
#               charge_customer(current_account.customer_token)
#             else
#               customer = Stripe::Customer.create(
#                 :email => params[:email],
#                 :card  => params[:subscription_stripe_card_token]
#               )
#               charge_customer(customer.id)
#               current_account.update_attribute :customer_token, customer.id
#             end
#           elsif current_account.charges.last.expiring_at < Time.now
#             charge_customer(current_account.customer_token)
#           else
#             flash[:notice] = "Your previous party plan is still activated"
#           end
#         end
#         redirect_to edit_account_registration_path
#       rescue Stripe::CardError => e
#         flash[:error] = e.message
#         redirect_to edit_account_registration_path
#       end
#
#       def destroy
#         subscription = Subscription.find(params[:id])
#         sub = Stripe::Subscription.retrieve(subscription.subscription_id)
#         sub.delete
#         subscription.destroy
#         current_account.update_attribute :role, 'player'
#         flash[:success] = "Successfully cancelled the subscription"
#         redirect_to edit_account_registration_path
#       end
#
#       def stripe_web_hooks
#         if params[:type]=='customer.subscription.updated'
#           subscription = Subscription.find_by(subscription_id: params[:data][:object][:id])
#           if subscription.present?
#             subscription.update_attributes(current_period_start: Time.at(params[:data][:object][:current_period_start]), current_period_end: Time.at(params[:data][:object][:current_period_end]))
#           end
#         end
#         render :json => true
#       end
#
#
#       protected
#
#       def check_user
#         unless current_account
#           redirect_to accounts_step_one_path
#         end
#       end
#
#       def charge_customer(cus_token)
#         charge = Stripe::Charge.create(
#           :customer    => cus_token,
#           :amount      => 2000,
#           :description => 'Music Mayhem Party Pack',
#           :currency    => 'usd'
#         )
#         Charge.new.generate(charge, current_account.email, current_account.id)
#         current_account.update_attribute :role, 'user'
#         flash[:success] = "Successfully Completed"
#       end
#
#       def create_subscription(cus_token, plan)
#         subscription = Stripe::Subscription.create(
#           customer: cus_token,
#           plan: plan
#         )
#         Subscription.new.generate(cus_token, subscription, current_account)
#         flash[:success] = "Successfully subscribed to " + subscription.plan.name
#       end
    end
  end
end
