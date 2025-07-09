require 'net/http'
require 'uri'

module Api
    module V1
        class VideosController < ApplicationController
            def index
                videos = Video.all.map do |video|
                    {
                        id: video.id,
                        title: video.title,
                        url: video.url,
                        state: video.state,
                        thumb: video.thumb.path,
                        stream_name: video.stream_name,
                        video_cdn: video.video_cdn, 
                        video_thumb: video.video_thumb,
                        description: video.description,
                        is_featured: video.is_featured,
                        schedule: video.schedule
                    }
                end
                render json: {videos: videos}    
            end
            def play
                url_to = ENV['VIDEO_API_URL']
                @video=Video.find(params[:id])
                begin
                    url = URI.parse("#{ENV['VIDEO_API_URL']}/streams/entries")
                    data = { title: @video.title , stream_name: @video.stream_name, file_url: @video.url, stream_id: @video.id}

                    # Create a new HTTP POST request
                    request = Net::HTTP::Post.new(url.path)

                    # Set the request body (data) as JSON
                    request.body = data.to_json

                    # Set the request headers (optional)
                    request['Content-Type'] = 'application/json'

                    # Send the request and get the response
                    response = Net::HTTP.start(url.host, url.port, use_ssl: url.scheme == 'https') do |http|
                        http.request(request)
                    end

                    # Process the response
                    if response.is_a?(Net::HTTPSuccess)
                        @video.update(state: "live")
                        redirect_to admin_videos_path, notice: 'Streaming started'
                    else
                        redirect_to admin_videos_path, alert: "Atart streaming failed!: Response: #{response.body}"
                    end
                rescue StandardError => e
                    # Handle the network failure
                    redirect_to admin_videos_path, alert: "Failed to connect to the streaming server!: #{e}"
                end
            end
            def show
                video = Video.find(params[:id])
                render json: video.as_json(only: [:id, :title, :url, :state, :schedule, :is_private, :thumb ], methods: [:video_url, :video_cdn, :video_thumb])
            rescue ActiveRecord::RecordNotFound
                render json: { error: 'Video not found' }, status: :not_found
            end
            def end
                @video = Video.find(params[:id])
                @video.update(state: "finished")
                render json: { success: "ok" }
            rescue ActiveRecord::RecordNotFound
                render json: { error: 'Video not found' }, status: :not_found
            end
            def destroy_image
                @video = Video.find(params[:id])
                @video.delete_image
                redirect_to admin_videos_path, notice: 'Image was successfully deleted.'
            end
        end
    end
end

