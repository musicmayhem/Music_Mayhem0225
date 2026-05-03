import React from "react";
import { FormGroup, Container, Row, Col, Alert } from "reactstrap";
import { connect } from "react-redux";
import LoginForm from "./LoginForm";
import RegistrationForm from "./RegistrationForm";
import { logInUser, checkUserIsLogin } from "../actions/loginActions";
import { createUser, createGuestUser, resendEmailConfirmation } from "../actions/registrationActions";
import { getGameData } from "../actions/hostGameActions";
import Swal from "sweetalert2";
import { makeRequest } from "../actions/gameAction";
import { GUEST_NAME } from "../constants/playerConstants";

const maskEmail = (email) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  return local.slice(0, 2) + "****@" + domain;
};

class PlayGameAs extends React.Component {
  state = {
    playAs: "quick",
    showOnce: true,
    creatGuestUser: false,
    guestCreated: false,
    getGuestUsername: true,
    guestNameGenerated: false,
    guestName: "",
    quickName: "",
  };

  UNSAFE_componentWillMount() {
    this.props.getGameData({
      game: { code: this.props.match.params.game_code },
    });
    this.props.checkUserIsLogin().then((res) => {
      if (res) {
        const game_code = this.props.match.params.game_code;
        if (localStorage["temp_user"]) {
          this.props.history.push("/confirm-otp", { gameCode: game_code });
        } else {
          this.props.history.push("/player/" + game_code);
        }
      }
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth.name && this.state.playAs === "quick" && !this.state.quickName) {
      this.setState({ quickName: nextProps.auth.name });
    }
    if (
      this.state.showOnce &&
      nextProps.auth &&
      nextProps.auth.confirmation_status &&
      Object.keys(nextProps.auth.confirmation_status) &&
      Object.keys(nextProps.auth.confirmation_status).length > 0
    ) {
      this.setState({ showOnce: false });
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Please check your Email!!",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    if (nextProps.auth && nextProps.auth.data && nextProps.game.game) {
      const game_code = nextProps.match.params.game_code;
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
      } else if (localStorage["temp_user"]) {
        const email =
          nextProps.auth.data &&
          nextProps.auth.data.account &&
          nextProps.auth.data.account.email;
        this.props.history.push("/confirm-otp", {
          gameCode: game_code,
          email: email || null,
        });
      } else {
        this.props.history.push("/player/" + game_code);
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

  loginValues = (values) => {
    this.props.logInUser(values);
  };

  registrationValues = (values) => {
    localStorage["temp_user"] = true;
    values["account"]["password"] = "password";
    values["account"]["password_confirmation"] = "password";
    values["account"]["name"] = values["account"]["username"];
    this.props.createUser(values);
  };

  joinQuick = () => {
    const name = this.state.quickName.trim();
    if (!name) return;
    this.props.createGuestUser({
      guest: true,
      name,
      game_code: this.props.match.params.game_code,
    });
  };

  confirmEmail = () => {
    Swal.mixin({
      input: "email",
      confirmButtonText: "Submit",
      showCancelButton: false,
    })
      .queue([{ title: "Enter your email to confirm" }])
      .then((result) => {
        if (result.value) {
          this.props.resendEmailConfirmation(result.value[0]);
        }
      });
  };

  render() {
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
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
                        this.setState({
                          playAs: "quick",
                          quickName: this.props.auth.name || "",
                          getGuestUsername: !this.props.auth.name,
                          guestNameGenerated: !!this.props.auth.name,
                        });
                      }}
                    >
                      <div>{this.state.playAs === "quick" && <div />}</div>
                      <label>JUST TAKE ME TO THE GAME</label>
                    </div>
                    <div
                      className="radio-round"
                      onClick={() => this.setState({ playAs: "user" })}
                    >
                      <div>{this.state.playAs === "user" && <div />}</div>
                      <label>I HAVE AN ACCOUNT</label>
                    </div>
                    <div
                      className="radio-round"
                      onClick={() => this.setState({ playAs: "guest" })}
                    >
                      <div>{this.state.playAs === "guest" && <div />}</div>
                      <label>CREATE FREE ACCOUNT</label>
                    </div>
                  </FormGroup>
                  {this.state.playAs === "quick" && (
                    <div>
                      <div className="custom-form-field-w-label">
                        <label
                          style={{
                            color: "#fff",
                            marginBottom: "0.4rem",
                            display: "block",
                            fontSize: "0.85rem",
                          }}
                        >
                          DESIRED USERNAME
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={this.state.quickName}
                          onChange={(e) =>
                            this.setState({ quickName: e.target.value })
                          }
                          placeholder={this.props.auth.name || "Loading..."}
                        />
                      </div>
                      <button
                        className="btn mayhem-btn-yellow btn-block"
                        style={{ marginTop: "1rem", fontWeight: "600" }}
                        disabled={
                          !this.state.quickName.trim() ||
                          this.props.auth.creatingAccount
                        }
                        onClick={this.joinQuick}
                      >
                        {this.props.auth.creatingAccount
                          ? "JOINING..."
                          : "CONTINUE"}
                      </button>
                    </div>
                  )}
                  {this.state.playAs === "user" && (
                    <LoginForm loginValues={this.loginValues} {...this.props} />
                  )}
                  {this.state.playAs === "guest" && (
                    <RegistrationForm
                      getGuestName={(value) =>
                        this.setState({ getGuestUsername: value })
                      }
                      creatGuest={(value, name) =>
                        this.setState({ creatGuestUser: value, guestName: name })
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
                  <a onClick={this.confirmEmail}>Resend Account Confirmation?</a>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logInUser: (params) => dispatch(logInUser(params)),
    createUser: (params) => dispatch(createUser(params)),
    createGuestUser: (params) => dispatch(createGuestUser(params)),
    checkUserIsLogin: (params) => dispatch(checkUserIsLogin(params)),
    getGameData: (params) => dispatch(getGameData(params)),
    resendEmailConfirmation: (email) => dispatch(resendEmailConfirmation(email)),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
  };
};

export default connect(
  (state) => ({
    auth: state.auth,
    game: state.game,
    initialValues: { account: { login: "", password: "", remember_me: true } },
  }),
  mapDispatchToProps
)(PlayGameAs);
