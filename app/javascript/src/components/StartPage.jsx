import React from "react";
import { Container } from "reactstrap";
import { Row, Col } from "react-flexbox-grid";
import { Link } from "react-router-dom";
import Record from "../images/icon_music.svg";
import Stopwatch from "../images/icon_stopwatch.svg";
import Spell from "../images/icon_spelling.svg";
import GameCodeChecker from "./GameCodeChecker";
import { checkUserIsLogin } from "../actions/loginActions";
import { connect } from "react-redux";
import { makeRequest } from "../actions/gameAction";
import { START_DEMO_GAME } from "../constants/gameConstants";

let redirectWindow = null;
class Main extends React.Component {
  state = {
    demoFromUrl: false,
  };

  UNSAFE_componentWillMount() {
    let cPath = window.location.href.toString().split(window.location.host)[1];
    if (cPath === "/demo#start_demo_game") {
      this.setState({ demoFromUrl: true });
      this.props.makeRequest("games/demo", { type: START_DEMO_GAME });
    }
    this.props.checkUserIsLogin().then((res) => {
      if (res) this.props.history.push("/index");
    });
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (
      !this.state.demoFromUrl &&
      np.game.startPage &&
      np.game.demoGame &&
      this.props.game.gettingData &&
      !np.game.gettingData
    ) {
      const game_code = np.game.demoGame.code;
      redirectWindow.location = "/games/" + game_code;
    }
    if (
      this.state.demoFromUrl &&
      np.game.startPage &&
      np.game.demoGame &&
      this.props.game.gettingData &&
      !np.game.gettingData
    ) {
      const game_code = np.game.demoGame.code;
      window.location = "/games/" + game_code;
    }
  }

  startDemoGame = () => {
    redirectWindow = window.open(
      "/loader",
      "_blank",
      "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=9999, height=9999"
    );
    this.props.makeRequest("games/demo", { type: START_DEMO_GAME });
  };

  render() {
    return (
      <Container>
        <Row center="xs" style={{ color: "#fff" }}>
          <h2 style={{ lineHeight: "1", fontWeight: "bold" }}>
            TIME TO MAYHEM!
          </h2>
          <GameCodeChecker
            buttonText={"JOIN"}
            changedButtonText={"JOINING..."}
            {...this.props}
          />
          <Col xs={12} md={8} style={{ margin: "2rem 0" }}>
            <Row
              center="xs"
              bottom="xs"
              style={{ color: "#ffca27", fontSize: "0.9rem" }}
            >
              <Col xs={4}>
                <img src={Record} width="45px" style={{ margin: "0.5rem 0" }} />
                <p>Guess The Song Title & Artist</p>
              </Col>
              <Col xs={4}>
                <img
                  src={Stopwatch}
                  width="40px"
                  style={{ margin: "0.5rem 0" }}
                />
                <p>Faster Answers Get More Points</p>
              </Col>
              <Col xs={4}>
                <img src={Spell} width="40px" style={{ margin: "0.5rem 0" }} />
                <p>To Score, Just Get Close! (70%)</p>
              </Col>
            </Row>
          </Col>
          <Col xs={12} md={7} style={{ margin: "0rem 0 1rem 0" }}>
            <Row center="xs" style={{ color: "#fff" }}>
              <Col xs={4} style={{ borderRight: "1px solid #fff" }}>
                <a
                  href="https://live.gomayhem.com"
                  target="_blank"
                  className="mayhem-link-white"
                >
                  <span>Live</span>
                </a>
              </Col>
              <Col xs={4} style={{ borderRight: "1px solid #fff" }}>
                <Link to="/login" className="mayhem-link-white">
                  <span>Login</span>
                </Link>
              </Col>
              <Col xs={4}>
                <Link to="/sign_up" className="mayhem-link-white">
                  <span>Register</span>
                </Link>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
  };
};

export default connect(
  (state) => {
    return {
      auth: state.auth,
      game: state.game,
    };
  },
  mapDispatchToProps
)(Main);
