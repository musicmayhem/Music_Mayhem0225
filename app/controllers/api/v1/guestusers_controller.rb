module Api
  module V1
    class GuestusersController < ApplicationController
      protect_from_forgery :except => [:create]
	  	respond_to :json
      swagger_controller :guest_users, 'GuestUsers'

    	swagger_api :create do
        summary 'Create Guest User'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      swagger_api :update do
        summary 'Update Guest Account'
        param :query, :email, :string, :required, "Email"
        param :query, :username, :string, :required, "Username"
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

			def create
        @code = params[:game_code]

        if params[:guest]
          guest_name = params[:name] || GuestusersController.guest_random_name
          @account = Account.new(
            name: guest_name,
            email: guest_name + '@fake_account.com',
            username: guest_name,
            password: 'password',
            password_confirmation: 'password',
            temp_account: true,
            remember_me: true
          )
        else
          username_present = Account.find_by_username(params[:account][:username])
          if !username_present
            guest_name = params[:account][:name] || GuestusersController.guest_random_name
            @account = Account.new(
              name: params[:account][:username],
              email: params[:account][:email],
              username: params[:account][:username],
              password: 'password',
              password_confirmation: 'password',
              temp_account: true,
              remember_me: true,
              game_code: @code
            )
          else
            render json: { error: 'Username already taken' }, status: 300
          end
        end
        return nil unless @account

        @account.skip_confirmation_notification!
        if @account.save
          @account.send_confirmation_instructions
          sign_in @account
        else
          acc = Account.find_by_email(params[:account][:email]) if params[:account] && params[:account][:email]
          acc&.resend_confirmation_instructions
          render json: { errors: @account.errors }, status: 403
        end
      end

      def update
        update_email = params[:email]
        @account = Account.find_by(username: params[:username]).update(email: update_email)
      end

      def self.guest_random_name
        name = RandomName.order('RANDOM()').where(alloted: false).take
        if name.present?
          name.update(alloted: true)
          name.fake_name
        else
          "user-"+SecureRandom.hex(5)
        end
      end
    end
  end
end
