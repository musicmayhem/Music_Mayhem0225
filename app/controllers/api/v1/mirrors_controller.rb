module Api
  module V1
    class MirrorsController < ApplicationController
      include ApplicationHelper

      before_action :find_game

      def mirror_data
        return nil unless @game

        @round_count = @game.rounds.count if @game.rounds
        @players_count = current_account ?  current_account&.players.count : 0
        @total_songs_count = @game.song_countz
        @rounds = @game.current_round
        @already_played_song_ids = @game.already_played_song_ids
        @current_session = @game.current_session
        @songs_url = bcg_music_url
        @series_name = nil
        if @game.session_id
          session = OpenSession.find(@game.session_id)
          series = Series.find(session.series_id) if session && session.series_id
          @series_name = series.name if series && series.active
        end
        get_advertisement_images(@game) if @game.campaign_id
      end

      def game_over_data
        return nil unless @game

        @leaderboard_data = {
          settings: @game.current_round.settings,
          leaderboard: @game.open_session ? @game.game_session_score[0].take(10).as_json : @game.leaderboard.as_json(methods: [:total_score, :logo] ).take(5).as_json
        }
      end

      private

      def find_game
        @game = Game.find_by_code(params[:code])
        @game
      end

      def get_advertisement_images(game)
        @advertise_images = game.adv_url_and_type
        @advertise_time = game.campaign.duration
      end
    end
  end
end
