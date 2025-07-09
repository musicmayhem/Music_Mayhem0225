import React from "react";
import Modal from "react-responsive-modal";
import VideoModal from "./VideoModal";
import { Button } from "reactstrap";

class VideoButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    const { isButton } = this.props;

    return (
      <div>
        {isButton ? (
          <Button className="mayhem-btn-blue" onClick={this.openModal}>
            <i
              style={{
                marginRight: "10px",
                fontSize: "1.2rem",
                position: "relative",
                bottom: "-0.1rem",
              }}
              className="fa fa-play"
            />{" "}
            Play Demo
          </Button>
        ) : (
          <a
            style={{ float: "right", color: "#ffca27" }}
            onClick={this.openModal}
            target="_blank"
          >
            <i className="fa fa-play" aria-hidden="true"></i> Play Demo
          </a>
        )}

        <Modal
          center
          onClose={() => {
            this.closeModal();
          }}
          open={this.state.modalIsOpen}
          style={{
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              height: "80%",
            },
          }}
        >
          <VideoModal
            style={{ padding: "20px" }}
            url="https://d234f1dp6su1hn.cloudfront.net/LivePhoneShowWith7Songs.mp4"
          />
        </Modal>
      </div>
    );
  }
}

export default VideoButton;
