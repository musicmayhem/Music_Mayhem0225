import React, { Component } from 'react';
import ReactPlayer from 'react-player';

class CenteredVideoPlayer extends Component {
  render() {
    const url = "https://d234f1dp6su1hn.cloudfront.net/LivePhoneShowWith7Songs.mp4"

    return (
      <div className="centered-video-player-container">
        <div className="video-center"> 
          <ReactPlayer 
            url={url} 
            config={{ file: { attributes: { controlsList: "nodownload" } } }}
            controls 
            width="100%" 
            height="100%" />
        </div>
      </div>
    );
  }
}

export default CenteredVideoPlayer;