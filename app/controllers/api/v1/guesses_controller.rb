module Api
  module V1
    class GuessesController < ApplicationController
      protect_from_forgery :except => [:create]
      respond_to :json
      swagger_controller :guesses, 'Guesses'

      swagger_api :create do
        summary 'Guess validation and score calculation'
        param :header, 'Authentication', :string, :required, 'Authentication token'
        param :query, :player_guess, :string, :optional, "Enter the Guess"
        response :unauthorized
        response :not_acceptable
        response :requested_range_not_satisfiable
      end

      def create
        if params[:guess] && params[:guess][:player_id]
          @player = Player.find(params[:guess][:player_id])
          @game = @player.game
          @guess = generate_guess
          if @guess&.save
            if @game.reset_round
              @score = @game.round_wise_score.map{|x| x["name"] == @player.name ? x["total_score"] : nil}.compact
            elsif @game.open_session
              @score = @player.current_round_score
            else
              @score = @player.total_score
            end
            render json: {guess: @guess,score: @score}
          else
            render json: {}
          end
        end
      end

      def generate_guess
        guess = Guess.find_or_initialize_by(
          player_id: @player.id,
          song_play_id: @game.current_song_id,
          account_id: @player.account_id,
          round_id: @game.current_round_id
        )
        if @game.current_song
          puts @game.current_song
          song = @game.current_song.song
          guess.song_artist = song.artist
          guess.song_title = song.title
          guess.song_year = song.year
          guess.player_status = params[:guess][:player_status]
          guess.submitted_at = Time.now
          
          # Remove current implemenation of guessing time from typing start time to raw time  

          # if params[:guess][:typing_start_time]
          #   if (Time.now.to_f*1000 - params[:guess][:typing_start_time])/1000 < 20
          #     guess.submitted_at = Time.at( params[:guess][:typing_start_time] / 1000.0 )
          #   else
          #     guess.submitted_at = Time.now - 20.seconds
          #   end
          # else
          #   guess.submitted_at = Time.now
          # end

          if @game.name == "solo" || @game.name == "demo"
            guess.artist = params[:guess][:player_guess]
            guess.title = params[:guess][:player_guess]
          else
            guess.artist = params[:guess][:title]
            guess.title = params[:guess][:title]
            guess.year = params[:guess][:title]
          end
          guess
        end
      end

    end
  end
end
