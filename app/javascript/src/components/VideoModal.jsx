import React from "react";
import ReactPlayer from "react-player";

class VideoModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      volume: 0.8,
      played: 0,
      loaded: 0,
    };
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.handleProgress = this.handleProgress.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
  }
  handlePlayPause() {
    this.setState({ playing: !this.state.playing });
  }

  handleProgress(state) {
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state);
    }
  }

  handleEnded() {
    this.setState({ playing: false });
  }

  render() {
    const { url } = this.props;
    const { playing, volume, played, loaded } = this.state;

    return (
      <div className="video-player">
        <ReactPlayer
          config={{ file: { attributes: { controlsList: "nodownload" } } }}
          url={url}
          playing={playing}
          volume={volume}
          onProgress={this.handleProgress}
          onEnded={this.handleEnded}
          width="100%"
          height="100%"
          controls
        />
      </div>
    );
  }
}

export default VideoModal;
