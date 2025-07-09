import React from "react";
import { FormGroup, Container, Row, Col, Alert } from "reactstrap";
import { connect } from "react-redux";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";
import { logInUser, checkUserIsLogin } from "../actions/loginActions";
import { createGuestUser } from "../actions/registrationActions";
import { getGameData } from "../actions/hostGameActions";
import Swal from "sweetalert2";
import { postRequest, makeRequest } from "../actions/gameAction";
import { RESEND_EMAIL_CONFIRMATION } from "../constants/authConstants";
import { GUEST_NAME } from "../constants/playerConstants";
import Trophy from "../images/Trophy.svg";
import ConfirmOtp from "./ConfirmOtp";

class PlayGameAs extends React.Component {
  state = {
    playAs: "user",
    showOnce: true,
    creatGuestUser: false,
    guestCreated: false,
    getGuestUsername: false,
    guestNameGenerated: false,
    guestName: "",
  };

  UNSAFE_componentWillMount() {
    this.props.getGameData({
      game: { code: this.props.match.params.game_code },
    });
    this.props.checkUserIsLogin().then((res) => {
      if (res) {
        if (localStorage["temp_user"]) {
          this._showEmailDiv = true;
        } else {
          let game_code = this.props.match.params.game_code;
          this.props.history.push("/player/" + game_code);
        }
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.showOnce &&
      nextProps.auth &&
      nextProps.auth.confirmation_status &&
      Object.keys(nextProps.auth.confirmation_status) &&
      Object.keys(nextProps.auth.confirmation_status).length > 0
    ) {
      this.setState({ showOnce: false });
      Swal({
        position: "center",
        type: "success",
        title: "Please check your Email!!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (nextProps.auth && nextProps.auth.data && nextProps.game.game) {
      let game_code = nextProps.match.params.game_code;
      if (
        nextProps.auth &&
        nextProps.auth.currentAccount &&
        nextProps.auth.currentAccount.account &&
        nextProps.game.game &&
        nextProps.game.game.account_id &&
        nextProps.game.game.account_id ===
          nextProps.auth.currentAccount.account.id
      ) {
        this.props.history.push("/config/" + game_code);
      } else {
        if (localStorage["temp_user"]) this._showEmailDiv = true;
        else this.props.history.push("/player/" + game_code);
      }
    }
  }

  componentDidUpdate() {
    if (this.state.creatGuestUser && !this.state.guestCreated) {
      this.setState({ guestCreated: true });
      this.props.createGuestUser({
        guest: true,
        name: this.state.guestName,
        game_code: this.props.match.params.game_code,
      });
    }
    if (this.state.getGuestUsername && !this.state.guestNameGenerated) {
      this.props.makeRequest("player/get_random_name", { type: GUEST_NAME });
      this.setState({ guestNameGenerated: true });
    }
  }

  _showEmailDiv = false;

  loginValues = (values) => {
    this.props.logInUser(values);
  };

  registrationValues = (values) => {
    localStorage["temp_user"] = true;
    values["account"]["password"] = "password";
    values["game_code"] = this.props.match.params.game_code;
    values["account"]["name"] = this.props.auth && this.props.auth.name;
    this.props.createGuestUser(values);
  };

  confirmEmail = () => {
    Swal.mixin({
      input: "email",
      confirmButtonText: "Submit",
      showCancelButton: false,
    })
      .queue([
        {
          title: "Enter your email to confirm",
        },
      ])
      .then((result) => {
        if (result.value) {
          this.props.postRequest("player/resend_email_confirmation", {
            type: RESEND_EMAIL_CONFIRMATION,
            values: { email: result.value[0] },
          });
        }
      });
  };

  playGame() {
    localStorage.removeItem("temp_user");
    this.props.history.push("/player/" + this.props.match.params.game_code);
  }

  render() {
    const email =
      this.props.auth.data &&
      this.props.auth.data.account &&
      this.props.auth.data.account.email;
    const username =
      this.props.auth.data &&
      this.props.auth.data.account &&
      this.props.auth.data.account.username;
    const name =
      this.props.auth.data &&
      this.props.auth.data.account &&
      this.props.auth.data.account.name;
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            {!this._showEmailDiv && (
              <div className="align-middle py-3">
                {this.props.auth && this.props.auth.errors && (
                  <Alert color="danger">{this.props.auth.errors}</Alert>
                )}
                <div>
                  <div className="custom-form">
                    <legend>SELECT A LOGIN OPTION:</legend>
                    <FormGroup tag="fieldset">
                      <div
                        className="radio-round"
                        onClick={() => {
                          this.setState({ playAs: "user" });
                        }}
                      >
                        <div>{this.state.playAs === "user" && <div />} </div>
                        <label>I HAVE AN ACCOUNT</label>
                      </div>
                      <div
                        className="radio-round"
                        onClick={() => {
                          this.setState({ playAs: "guest" });
                        }}
                      >
                        <div>{this.state.playAs === "guest" && <div />} </div>
                        <label>CREATE FREE ACCOUNT</label>
                      </div>
                    </FormGroup>
                    {this.state.playAs === "user" && (
                      <LoginForm
                        loginValues={this.loginValues}
                        {...this.props}
                      />
                    )}
                    {this.state.playAs === "guest" && (
                      <RegistrationForm
                        getGuestName={(value) =>
                          this.setState({ getGuestUsername: value })
                        }
                        creatGuest={(value, name) =>
                          this.setState({
                            creatGuestUser: value,
                            guestName: name,
                          })
                        }
                        registrationValues={this.registrationValues}
                        {...this.props}
                      />
                    )}
                  </div>
                  <div
                    style={{ margin: "1rem", textAlign: "center" }}
                    className="mayhem-link-white"
                  >
                    <a
                      onClick={() => {
                        this.confirmEmail();
                      }}
                    >
                      Resend Account Confirmation?
                    </a>
                  </div>
                </div>
              </div>
            )}
            {this._showEmailDiv && (
              <div style={{ textAlign: "center", padding: "1.2rem" }}>
                {this.props.auth && this.props.auth.errors && (
                  <Alert color="danger">{this.props.auth.errors}</Alert>
                )}

                <p style={{ fontSize: "1.4rem", color: "white" }}>
                  VERIFY YOUR ACCOUNT
                </p>
                <span style={{ left: "1.8rem", position: "absolute" }}>
                  <img src={Trophy} width=" 75px" />
                </span>
                <br />
                <p
                  style={{
                    fontSize: "1rem",
                    textAlign: "left",
                    color: "white",
                    fontWeight: "500",
                    paddingTop: "4rem",
                  }}
                >
                  We've sent a 4-digit verification code to your email
                  <b>{email} </b>. Please enter it below to complete your
                  signup, play as <b> {name} </b>
                </p>
                <div style={{ border: "0.5px solid #621f3b" }} />
                <br />
                <ConfirmOtp playGame={this.playGame} />
                <a
                  style={{
                    color: "#d2435f",
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                  onClick={() => this.playGame()}
                >
                  or continue as {username} for now
                </a>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logInUser: (params) => dispatch(logInUser(params)),
    createGuestUser: (params) => dispatch(createGuestUser(params)),
    checkUserIsLogin: (params) => dispatch(checkUserIsLogin(params)),
    getGameData: (params) => dispatch(getGameData(params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
  };
};

export default connect((state) => {
  return {
    auth: state.auth,
    game: state.game,
    initialValues: { account: { login: "", password: "", remember_me: true } },
  };
}, mapDispatchToProps)(PlayGameAs);
