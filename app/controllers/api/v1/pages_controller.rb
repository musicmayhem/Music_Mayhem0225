module Api
  module V1
    class PagesController < ApplicationController

      respond_to :json
      swagger_controller :games, 'Games'

      swagger_api :shared do
        summary 'Shares the game on the monitor screen'
        param :query, :game_code, :string, :required, 'Game Code'
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

    	def index
		  end

		  def share
		  end

		  def shared
		    code = params[:game_code].upcase
		    @not_found = Game.where(:code => code).blank?
		    if @not_found
		      @shared_json = "Invalid game code"
		    else
		      @shared_json = " render this : #{request.base_url}/games/#{code}/monitor"
		    end
		  end

		  def help
		  end

		  def playlist
		  end

		  def sample
		  end

		  def waiting
		  end

		  def game_code
		  end

		  def start
		  end

		  def feedback
		  	if params[:feedback]
		  		name = params[:feedback][:name]
			  	user = params[:feedback][:email]
			  	subject = params[:feedback][:type]
			  	message = params[:feedback][:message]
			  	# if (Rails.env.production? || Rails.env.staging? )
			      UserMailer.feedback_email(subject,user,message,name).deliver
			    # end
			    @mail_response = "Mail Send"
			end
		  end
   	   end
	end
end
