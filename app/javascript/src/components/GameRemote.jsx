/* global location localStorage window setTimeout*/
import React from "react";
import {
  Button,
  Container,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Collapse,
} from "reactstrap";
import { Field, reduxForm } from "redux-form";
import { Row, Col } from "react-flexbox-grid";
import pusher from "../constants/pusher";
import * as actions from "../actions/hostGameActions";
import { connect } from "react-redux";
import {
  postRequest,
  instantRequest,
  gamePlayers,
} from "../actions/gameAction";
import Swal from "sweetalert2";
import SpiffReward from "./Utils/SpiffReward";
import {
  RESET_GAME,
  GAME_LEADERBOARD,
  GET_SONG_DATA,
  SELECTED_SONG_SKIPPED,
  ADD_FEEDBACK,
  GIFT_TICKETS,
  UPDATE_APPLIANCE,
} from "../constants/gameConstants";
import { addNewRound } from "../actions/hostGameActions";
import LeaderBoardTable from "./LeaderBoardTable";
import Timer from "./Timer";
import { checkUserIsLogin } from "../actions/loginActions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { HelpSection } from "./Utils/HelpSection";
import ProgressBar from "./ProgressBar";
import CountDownTimer from "./CountDownTimer";
import SongAdditionalInfo from "./SongAdditionalInfo";
import ChatModal from "./ChatModal";
import Modal from "react-responsive-modal";
import { Link } from "react-router-dom";

const renderSelectField = ({
  input,
  label,
  meta: { touched, error },
  ...custom
}) => (
  <FormGroup className="custom-form-field-w-label">
    <Label style={{ color: "black" }}>{label}</Label>
    <Input {...input} {...custom} type="select" style={{ color: "#ffca27" }}>
      {custom.options}
    </Input>
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
);
const renderTextField = ({
  input,
  label,
  meta: { touched, error },
  ...custom
}) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input
      autoFocus={custom.autoFocus}
      onChange={input.onChange}
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
);

class GameRemote extends React.Component {
  state = {
    runOnce: true,
    backgroundMusic: false,
    showBackgroundCheckbox: false,
    nextRound: false,
    enableCurrentSongSkip: false,
    enableNextSongSkip: false,
    triviaMode: false,
    mayhemMatesMode: false,
    enableReload: false,
    enableReload2: false,
    pusherCurrentSongCount: null,
    showProgressBar: false,
    playerAnswerRecieved: false,
    ticketScoreRecieved: false,
    campaignUpdated: false,
    showSongFeedbackModal: false,
    showModalTextField: false,
    collapse: false,
    allowSongAdvance: false,
    songDuration: null,
    showChatModal: false,
    gamePlayers: null,
  };

  UNSAFE_componentWillMount() {
    this.props.dispatch(checkUserIsLogin()).then((res) => {
      if (!res) this.props.history.push("/");
      else if (res.account.role != "host")
        this.props.history.push("/player/" + this.props.match.params.game_code);
    });
    localStorage.removeItem("game_config_updated");
    this.props.dispatch(
      actions.getRemoteData({
        game: { code: this.props.match.params.game_code },
      })
    );
    this.getGameleaderboard();
    this.getSongData();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.game.feedbackUpdated && nextProps.game.feedbackUpdated) {
      this.getSongData();
      if (this._updateCurrentSong)
        this.props.dispatch(
          actions.getRemoteData({
            game: { code: this.props.match.params.game_code },
          })
        );
    }
    if (this.state.runOnce && nextProps.game.game) {
      this.setState({
        runOnce: false,
        showBackgroundCheckbox: nextProps.game.game.background_music,
      });
      this.loadGameData(nextProps.game);
      this.loadPlayerGuessData(nextProps.game);
      this._autoAdvance = nextProps.game.game.automatic_song_advance;
      this._openSession = nextProps.game.game.open_session;
      if (
        nextProps.game &&
        nextProps.game.game &&
        nextProps.game.game.game_mode
      ) {
        if (nextProps.game.game.game_mode == "Standard trivia")
          this.setState({ triviaMode: true });
        if (nextProps.game.game.game_mode == "Mayhem Mates")
          this.setState({ mayhemMatesMode: true });
      }

      if (
        nextProps.game.game &&
        nextProps.game.game.state &&
        nextProps.game.game.state == "Active Song"
      ) {
        setTimeout(() => {
          this.setState({
            enableCurrentSongSkip: true,
            enableNextSongSkip: true,
          });
        }, 5000);
        this._showNextSongs = true;
      }
      if (
        nextProps.game.game &&
        nextProps.game.game.state &&
        nextProps.game.game.state == "Song Loaded"
      ) {
        setTimeout(() => {
          this.setState({ enableCurrentSongSkip: true });
        }, 5000);
      }
      if (
        nextProps.game.game &&
        nextProps.game.game.state &&
        nextProps.game.game.state == "Showing LeaderBoard"
      ) {
        this.setState({ allowSongAdvance: true });
      }
    }

    if (nextProps.game && nextProps.game.new_code)
      location.replace("/config/" + nextProps.game.new_code);
  }

  getSongData() {
    this.props.dispatch(
      postRequest("games/skip_song_data", {
        type: GET_SONG_DATA,
        values: { game: { code: this.props.match.params.game_code } },
      })
    );
  }

  _openSession = false;
  _autoAdvance = false;
  _showNextSongs = false;

  resetGame = () => {
    Swal({
      title: "HOLD UP!",
      text: "Resetting gives you a new game code. This is a last resort if you're in the middle of a game.  If needed, make sure players know about the new code.",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Reset Game",
      cancelButtonText: "No, Keep Using This Game Code",
    }).then((result) => {
      if (result.value) {
        this.props.dispatch(
          postRequest("games/reset_game", {
            type: RESET_GAME,
            values: { game: { code: this.props.match.params.game_code } },
          })
        );
        Swal({
          type: "success",
          title: "Updated...",
          text: "Game Reset Successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };
  reloadGame() {
    Swal({
      type: "success",
      title: "Loading...",
      text: "Game Loaded Successfully!",
      showConfirmButton: false,
      timer: 1500,
    });
    if (
      this.state.enableReload &&
      this.props.game &&
      this.props.game.songCount !== this.props.game.totalSongCount
    ) {
      this.props.dispatch(
        postRequest("games/pusher_update", {
          values: {
            game: {
              code: this.props.match.params.game_code,
              status: "reloadGame",
            },
          },
        })
      );
    } else if (this.state.enableReload2 == true) {
      this.nextSongButton();
    } else {
      this.props.dispatch(
        postRequest("games/pusher_update", {
          values: {
            game: {
              code: this.props.match.params.game_code,
              status: "pageRefresh",
            },
          },
        })
      );
    }
  }

  gameOver = () => {
    Swal({
      title: "WAIT UP!",
      text: "This is the big moment to see who won!  Be sure you are done with all your drawings before you end the game for the night!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, End Game",
      cancelButtonText: "No, Draw Tickets Or Play More",
    }).then((result) => {
      if (result.value) {
        this.props.dispatch(
          postRequest("games/pusher_update", {
            values: {
              game: {
                code: this.props.match.params.game_code,
                status: "gameOver",
              },
            },
          })
        );
        Swal({
          type: "success",
          title: "Updated...",
          text: "Game Over Updated Successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  };

  getWheelType = () => {
    Swal.fire({
      title: "Wheel Type",
      type: "question",
      input: "select",
      inputOptions: {
        Default: "Default",
        "Player Names": "Player Names",
        "Bonus Wheel": "Bonus Wheel",
      },
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      cancelButtonText: "Cancel",
      confirmButtonText: "Spin!",
    }).then((result) => {
      if (result && result.value) {
        this.mayhemSpinnerRequest(result.value);
      }
    });
  };

  mayhemSpinnerRequest = (wheelType) => {
    this.props.dispatch(
      postRequest("games/pusher_update", {
        values: {
          game: {
            code: this.props.match.params.game_code,
            status: "openSpinWheel",
            wheel_type: wheelType,
          },
        },
      })
    );
    Swal({
      title: "MAYHEM SPINNER",
      text: "Mayhem Spinner will be started!",
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Start Spinner",
      cancelButtonText: "Close Spinner",
    }).then((result) => {
      if (result.value) {
        let randomSpin = Math.floor(Math.random() * 900) + 3000;
        this.props.dispatch(
          postRequest("games/pusher_update", {
            values: {
              game: {
                code: this.props.match.params.game_code,
                status: "startSpinWheel",
                random_spin: randomSpin,
              },
            },
          })
        );
        Swal({
          type: "success",
          title: "Wheel is Spinning .....",
          text: "Mayhem Spinner Started!",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        this.props.dispatch(
          postRequest("games/pusher_update", {
            values: {
              game: {
                code: this.props.match.params.game_code,
                status: "closeSpinWheel",
              },
            },
          })
        );
      }
    });
  };

  volumeButton(p) {
    this.props.dispatch(
      actions.sendVolumePusherRequest({
        game: { code: this.props.match.params.game_code },
        volume: p,
      })
    );
  }

  nextSongButton() {
    this.props.dispatch(
      actions.advanceSongInGame({
        game: { code: this.props.match.params.game_code },
      })
    );
    Swal({
      title: "Advancing song",
      text: "wait for it...",
      type: "success",
      timer: 1500,
    });
    this.setState({ enableNextSongSkip: false, allowSongAdvance: false });
  }

  skipNextSong() {
    this.props.dispatch(
      actions.skipAndAddSongCurrentGame({
        game: { code: this.props.match.params.game_code },
      })
    );
  }

  skipSelectedSong(song_id) {
    this.props.dispatch(
      postRequest(
        "games/skip_song_data",
        {
          type: SELECTED_SONG_SKIPPED,
          values: {
            game: { code: this.props.match.params.game_code },
            songId: song_id,
          },
        },
        true
      )
    );
  }

  loadGameData(gameData) {
    if (gameData.game) {
      let channel_name = "games_" + gameData.game.id;
      pusher.unsubscribe(channel_name);
      const channel = pusher.subscribe(channel_name);
      channel.bind("game_event", (data) => {
        console.log(data.type);
        switch (data.type) {
          case "active_song":
            this.setState({
              pusherCurrentSongCount: data.song_count,
              showProgressBar: true,
              songDuration: this.state.songDuration
                ? Date.now() + this.state.songDuration
                : null,
            });
            this.getSongData();
            this._showNextSongs = true;
            setTimeout(() => {
              this.setState({
                enableCurrentSongSkip: true,
                enableNextSongSkip: true,
              });
            }, 5000);
            setTimeout(() => {
              this.setState({ enableNextSongSkip: false });
            }, 50000);
            break;
          case "song_loaded":
            this._showNextSongs = false;
            this.setState({
              showProgressBar: false,
              songDuration: data.data.loaded_song.length_in_seconds
                ? parseInt(data.data.loaded_song.length_in_seconds) * 1000
                : null,
            });
            setTimeout(() => {
              this.setState({
                enableCurrentSongSkip: true,
                enableReload: true,
                enableReload2: false,
                pusherCurrentSongCount: data.data.song_of_songs_count,
              });
              this.props.dispatch(
                actions.getRemoteData({
                  game: { code: this.props.match.params.game_code },
                })
              );
            }, 5000);
            break;
          case "new_round_added":
            setTimeout(() => {
              var url = data.data.replace("/games/", "/config/");
              window.location = url;
            }, 11500);
            break;
          case "game_updated":
          case "start_new_game":
            var url = data.data.replace("/games/", "/config/");
            window.location = url;
            break;
          case "showing_leaderboard":
            this._updateCurrentSong = false;
            this.setState({
              enableCurrentSongSkip: false,
              enableNextSongSkip: false,
              enableReload: false,
              enableReload2: true,
              allowSongAdvance: true,
            });
            if (this.state.campaignUpdated) this.CampaignUpdatedAlert();
            break;
          case "skip_song":
            this.setState({
              enableNextSongSkip: false,
              enableCurrentSongSkip: false,
            });
            this.getGameleaderboard();
            break;
          case "guess_end":
            this.getGameleaderboard();
            break;
          case "last_10_songs":
            if (data.remaining_song_count == 0)
              this.noticeAlert("⚙️ No Songs left to skip in the playlist.");
            else
              this.noticeAlert(
                "⚙️ Only " +
                  `${data.remaining_song_count}` +
                  " songs left in the playlist to skip!"
              );
            break;
          case "campaign_updated":
            if (data.data.jukebox) {
              Swal({
                title: "Campaign Updated!",
                text: "Now game will be played automatically",
                icon: "info",
              });
            } else this.setState({ campaignUpdated: true });
            break;
          case "score_tied":
            this.noticeAlert(
              "⚙️ " + data.data.status + " Score Tied Between Players."
            );
            break;
          case "rewards_updated":
            if (data.auto_ticket && data.auto_ticket.status == "score111") {
              let winner =
                this.props.game &&
                this.props.game.songWinners &&
                this.props.game.songWinners.filter(
                  (x) => x.account_id === data.account_id
                )[0];
              if (winner)
                this.noticeAlert(
                  "⚙️ " + winner.name + " got 11 tickets for score 111."
                );
            }
            break;
          case "new_message":
            if (data.data.message_to == "Game Host")
              this.noticeAlert(
                " 💬 " +
                  data.data.message_from +
                  " : " +
                  data.data.message +
                  " "
              );
            break;
          case "pick_redeemed":
            this.noticeAlert(
              "⚙️ " + data.player_name + " used pick " + data.pick_type
            );
            break;
        }
      });
    }
  }

  noticeAlert(text) {
    toast.success(text, {
      position: "top-right",
      autoClose: 60000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      draggablePercent: 40,
      className: "toaster-css-2",
    });
  }

  getGameleaderboard() {
    this.props.dispatch(
      postRequest("games/game_leaderboard", {
        type: GAME_LEADERBOARD,
        values: { game: { code: this.props.match.params.game_code } },
      })
    );
  }

  loadPlayerGuessData(gameData) {
    if (gameData.game) {
      let channel_name = "players_guess_data_" + gameData.game.id;
      const channel = pusher.subscribe(channel_name);
      channel.bind("player_guess_event", (data) => {
        switch (data.type) {
          case "update_remote_score":
            // this.getGameleaderboard()
            break;
          case "update_player_pick":
            this.noticeAlert(
              "⚙️ PICK USED!" +
                `${data.data}` +
                " is picking the next playlist!"
            );
            break;
          case "player_muted":
            this.noticeAlert(
              "🔇 PICK USED! " +
                `${data.current_account}` +
                " muted " +
                `${data.muted_player}`
            );
            break;
        }
      });
    }
  }

  getHelp() {
    HelpSection();
  }

  addRound() {
    Swal({
      title: "WAIT!",
      text: "Did you do a drawing?  Drawings only work at the end of a round.  When you're ready, proceed to refresh player scores!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Add New Round",
      cancelButtonText: "Wait, I Still Need To Draw!",
    }).then((result) => {
      if (result.value) {
        this.setState({ nextRound: true });
        this.props.dispatch(
          addNewRound({ game: { code: this.props.match.params.game_code } })
        );
        Swal({
          type: "success",
          title: "Added...",
          text: "Round Added Successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }

  showSlides = (event) => {
    this.setState({ slideOptions: true });
    this.props.dispatch(
      postRequest("games/pusher_update", {
        values: {
          game: { code: this.props.match.params.game_code, status: event },
        },
      })
    );
  };

  showFeedbackModal() {
    const { handleSubmit } = this.props;
    let issues = [
      "short",
      "loud",
      "quiet",
      "explicit",
      "wrong year",
      "wrong artist",
      "wrong title",
      "wrong playlist",
      "other",
    ];
    return (
      <Modal
        open={this.state.showSongFeedbackModal}
        onClose={() => this.setState({ showSongFeedbackModal: false })}
        showCloseIcon={false}
        center
      >
        <div style={{ textAlign: "center", margin: "30px" }}>
          <Container
            style={{
              borderTop: "1px solid #ddd",
              borderBottom: "1px solid #ddd",
              padding: "1.5rem 0.5rem",
            }}
          >
            <Row start={"xs"}>
              <Col sm="8" style={{ textAlign: "center" }}>
                <p style={{ color: "#210344", fontSize: "3vmax" }}>
                  Song Feedback
                </p>
                <div>
                  <form onSubmit={handleSubmit(this.addFeedback)}>
                    <Row>
                      <Col sm="8" style={{ textAlign: "center" }}>
                        <Field
                          name="issues"
                          component={renderSelectField}
                          onChange={(p) => {
                            if (p.target.value == "other")
                              this.setState({ showModalTextField: true });
                            else this.setState({ showModalTextField: false });
                          }}
                          options={
                            issues
                              ? issues.map((p) => (
                                  <option key={p} value={p}>
                                    {" "}
                                    {p}{" "}
                                  </option>
                                ))
                              : ""
                          }
                          label="SELECT ISSUE"
                          autoFocus={true}
                        />
                        {this.state.showModalTextField && (
                          <Field
                            name="issuecomment"
                            component={renderTextField}
                            label="Enter Feedback"
                            className="custom-form-field-w-label-white "
                            autoFocus={this._focus}
                          />
                        )}
                      </Col>
                    </Row>
                    <Row>
                      <Col sm="6">
                        <button
                          style={{ marginTop: "10px" }}
                          id="config-start-btn"
                          className="mayhem-btn-blue btn-full-width"
                          type="submit"
                        >
                          SUBMIT!
                        </button>
                      </Col>
                      <Col sm="6">
                        <button
                          className="mayhem-btn-blue btn-full-width"
                          style={{ marginTop: "10px", backgroundColor: "red" }}
                          onClick={() =>
                            this.setState({ showSongFeedbackModal: false })
                          }
                        >
                          CANCEL
                        </button>
                      </Col>
                    </Row>
                  </form>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Modal>
    );
  }

  addFeedback = (values) => {
    this.setState({ showSongFeedbackModal: false });
    let song_id = this._feedbackSongId;
    var issue = values["issues"];
    let CurrentSongId =
      this.props.game &&
      this.props.game.current_song &&
      this.props.game.current_song.id;
    if (CurrentSongId == this._feedbackSongId) this._updateCurrentSong = true;
    if (
      values["issues"] == "other" &&
      values["issuecomment"] &&
      values["issuecomment"] != ""
    )
      issue = issue + ": " + values["issuecomment"];
    if (song_id && issue) {
      this.props.dispatch(
        postRequest("games/add_feedback", {
          type: ADD_FEEDBACK,
          values: {
            issue: issue,
            song_id,
            code: this.props.match.params.game_code,
            role: "host",
          },
        })
      );
    }
  };

  playerAnswer() {
    this.setState({ playerAnswerRecieved: false });
    this.props
      .dispatch(
        instantRequest("games/player_answers", {
          values: { game: { code: this.props.match.params.game_code } },
        })
      )
      .then((res) => {
        if (res) {
          this._playerAnswers = res.answers;
          this.setState({ playerAnswerRecieved: true });
        }
      });
  }

  ticketScore() {
    this.setState({ ticketScoreRecieved: false });
    this.props
      .dispatch(
        instantRequest("games/trivia_ticket_score", {
          values: { game: { code: this.props.match.params.game_code } },
        })
      )
      .then((res) => {
        if (res) {
          this._ticketScore = res.ticket_score;
          this.setState({ ticketScoreRecieved: true });
        }
      });
  }

  dateFormat(date) {
    let time = new Date(date);
    let value =
      time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
    return value;
  }

  sendTicketReward = (val) => {
    this.props.dispatch(
      postRequest("player/gift_tickets", {
        type: GIFT_TICKETS,
        values: { ticket: { game_id: val.game_id, player_id: val.player_id } },
      })
    );
  };

  CampaignUpdatedAlert() {
    Swal({
      title: "Campaign Updated!",
      text: "Please recheck configuration now!! ",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Recheck",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.value) {
        this.setState({ campaignUpdated: true });
        this.props.dispatch(
          postRequest("games/update_setting", {
            values: { game: { code: this.props.match.params.game_code } },
          })
        );
        this.props.dispatch(
          postRequest("games/update_appliance", {
            type: UPDATE_APPLIANCE,
            values: { game: { code: this.props.match.params.game_code } },
          })
        );
        window.location = "/config/" + this.props.match.params.game_code;
      }
    });
  }
  startDemoVideo = (e) => {
    e.preventDefault();
    redirectWindow = window.open(
      "/vdemo",
      "_blank",
      "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=9999, height=9999"
    );
  };

  _updateCurrentSong = false;
  _playerAnswers = null;
  _ticketScore = null;
  _feedbackSongId = null;

  render() {
    const {
      nextRound,
      enableCurrentSongSkip,
      enableNextSongSkip,
      showBackgroundCheckbox,
      backgroundMusic,
      pusherCurrentSongCount,
      triviaMode,
      mayhemMatesMode,
      showProgressBar,
      playerAnswerRecieved,
      ticketScoreRecieved,
      collapse,
      songDuration,
      showChatModal,
      gamePlayers,
    } = this.state;
    const {
      current_song,
      leaderboard,
      songWinners,
      songsData,
      totalSongCount,
      songCount,
      skipping,
    } = this.props.game;
    return (
      <Container>
        {nextRound && (
          <Timer
            time={0.1833333}
            data={"Next round will be added in"}
            position="no-position"
          />
        )}
        {showChatModal && (
          <ChatModal
            code={this.props.match.params.game_code}
            closeModal={() => this.setState({ showChatModal: false })}
          />
        )}
        {!nextRound && !triviaMode && !mayhemMatesMode && (
          <div>
            <Row>
              <Col xs={12} md={8} mdOffset={2} id="Formstyle">
                <Row center="xs">
                  <Col
                    xs={3}
                    style={{
                      fontSize: "20px",
                      padding: "5px",
                      left: "10px",
                      position: "absolute",
                    }}
                  >
                    <b>CODE: </b>
                    {this.props.match.params.game_code}
                    <br />
                  </Col>
                  <Col xs={3} style={{ color: "#ffca27" }}>
                    <div>
                      <a
                        onClick={() => {
                          this.getHelp();
                        }}
                      >
                        <i className="fa fa-life-ring" /> Host Help
                      </a>
                    </div>
                  </Col>
                  <Col xs={3} style={{ color: "#ffca27" }}>
                    <div>
                      <a
                        onClick={() => {
                          this.setState({ showChatModal: true });
                        }}
                      >
                        <i className="fa fa-comments-o" aria-hidden="true"></i>{" "}
                        Game Chat
                      </a>
                    </div>
                  </Col>
                  <Col xs={3} style={{ color: "#ffca27" }}>
                    <div>
                      <a onClick={this.startDemoVideo} target="_blank">
                        <i className="fa fa-play" aria-hidden="true"></i> Play
                        Demo
                      </a>
                    </div>
                  </Col>
                  <Col
                    xs={3}
                    style={{
                      fontSize: "20px",
                      padding: "5px",
                      right: "10px",
                      position: "absolute",
                    }}
                  >
                    {pusherCurrentSongCount
                      ? pusherCurrentSongCount
                      : this.props.game.currentSongCount}
                    <br />
                  </Col>
                </Row>
                {showProgressBar && (
                  <ProgressBar
                    timer={parseInt(
                      this.props.game &&
                        this.props.game.rounds &&
                        this.props.game.rounds.settings &&
                        this.props.game.rounds.settings.song_play_time
                    )}
                  />
                )}
                {!this._autoAdvance && songDuration && showProgressBar && (
                  <CountDownTimer songDuration={songDuration} />
                )}
                <h4
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    marginTop: "2rem",
                    textAlign: "center",
                  }}
                >
                  <Link
                    to={
                      "/config/" +
                      this.props.match.params.game_code +
                      "?continue"
                    }
                    onClick={() => {
                      this.props.dispatch(
                        postRequest("games/update_setting", {
                          values: {
                            game: { code: this.props.match.params.game_code },
                          },
                        })
                      );
                    }}
                  >
                    Configure
                  </Link>{" "}
                  | Control
                </h4>
                <Row center="xs">
                  <div style={{ display: "flex" }}>
                    <Col xs={6} sm={6} style={{ marginTop: "1rem" }}>
                      <div style={{ textalign: "center" }}>
                        {!this._autoAdvance && songCount != null && (
                          <Button
                            className="mayhem-btn-yellow"
                            disabled={
                              this._autoAdvance ||
                              !this.state.allowSongAdvance ||
                              songCount == totalSongCount
                            }
                            onClick={() => {
                              this.nextSongButton();
                            }}
                          >
                            ADVANCE
                          </Button>
                        )}
                      </div>
                    </Col>
                    <Col xs={6} sm={6} style={{ marginTop: "1rem" }}>
                      <div style={{ textalign: "center" }}>
                        {!this._autoAdvance && songCount != null && (
                          <Button
                            className="mayhem-btn-yellow"
                            disabled={
                              this._autoAdvance || !this.state.allowSongAdvance
                            }
                            onClick={() => {
                              this.getWheelType();
                            }}
                          >
                            MAYHEM
                          </Button>
                        )}
                      </div>
                    </Col>
                  </div>
                </Row>
                <br />
                <Row center="xs">
                  <div style={{ display: "flex" }}>
                    <Col xs={6} sm={6} start="xs">
                      {" "}
                      <Button
                        className="mayhem-btn-yellow"
                        onClick={() => {
                          this.volumeButton("up");
                        }}
                      >
                        Vol Up
                      </Button>
                    </Col>
                    <Col xs={6} sm={6}>
                      {" "}
                      <Button
                        className="mayhem-btn-yellow"
                        onClick={() => {
                          this.volumeButton("down");
                        }}
                      >
                        Vol Down
                      </Button>
                    </Col>
                  </div>
                </Row>
                <Row center="xs">
                  <Col xs={12} style={{ marginTop: "1.5rem" }}>
                    {!this._openSession && (
                      <Button className="mayhem-btn-yellow" disabled>
                        Add Round
                      </Button>
                    )}
                    {this._openSession && songCount != totalSongCount && (
                      <Button className="mayhem-btn-yellow" disabled>
                        Add Round
                      </Button>
                    )}
                    {this._openSession &&
                      songCount != null &&
                      songCount == totalSongCount && (
                        <Button
                          onClick={() => {
                            this.addRound();
                          }}
                          className="mayhem-btn-yellow"
                        >
                          Add Round
                        </Button>
                      )}
                  </Col>
                </Row>
                {showBackgroundCheckbox && (
                  <div>
                    <div
                      className="remember-me"
                      onClick={() => {
                        this.setState({
                          backgroundMusic: !this.state.backgroundMusic,
                        });
                      }}
                    >
                      <div>
                        {backgroundMusic && (
                          <i
                            style={{ color: "white" }}
                            className="fa fa-check"
                          />
                        )}{" "}
                      </div>
                      <label>BACKGROUND MUSIC VOLUME</label>
                    </div>
                    {backgroundMusic && (
                      <Row center="xs">
                        <div style={{ display: "flex" }}>
                          <Col xs={6} sm={6} start="xs">
                            {" "}
                            <Button
                              className="mayhem-btn-yellow"
                              onClick={() => {
                                this.volumeButton("bcg_up");
                              }}
                            >
                              {" "}
                              Vol +{" "}
                            </Button>
                          </Col>
                          <Col xs={6} sm={6}>
                            {" "}
                            <Button
                              className="mayhem-btn-yellow"
                              onClick={() => {
                                this.volumeButton("bcg_down");
                              }}
                            >
                              Vol -{" "}
                            </Button>
                          </Col>
                        </div>
                        <br />
                      </Row>
                    )}
                  </div>
                )}
                <br />
                {!skipping && (
                  <div>
                    {current_song && (
                      <Row>
                        <Col xs={10} xsOffset={1}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <h5>Current Song</h5>
                            {enableCurrentSongSkip && (
                              <b
                                style={{
                                  color: "#ffcb4a",
                                  textDecoration: "underline",
                                }}
                                onClick={() => {
                                  this.skipNextSong();
                                }}
                              >
                                Skip
                              </b>
                            )}
                          </div>
                          <div className="song-info-css">
                            <b>Title: </b>
                            {current_song.title}
                            <br />
                            <b>Artist: </b>
                            {current_song.artist}
                            <br />
                            <b>Year: </b>
                            {current_song.year}
                            <br />
                            {(current_song.additional_data.single_data.length >
                              0 ||
                              current_song.additional_data.double_data.length >
                                0 ||
                              current_song.additional_data.question_answer_data
                                .length > 0) && (
                              <div>
                                <b
                                  onClick={() =>
                                    this.setState({
                                      collapse:
                                        current_song.id == collapse
                                          ? false
                                          : current_song.id,
                                    })
                                  }
                                  style={{
                                    color: "blue",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Additional Info
                                </b>
                                <div>
                                  <SongAdditionalInfo
                                    collapse={collapse}
                                    song={current_song}
                                    additionalData={
                                      current_song.additional_data
                                    }
                                  />
                                </div>
                              </div>
                            )}
                            {true && (
                              <div>
                                <b style={{ color: "red" }}>ISSUE: </b>
                                {current_song.issues}
                                {!current_song.issues && (
                                  <b
                                    style={{
                                      color: "blue",
                                      textDecoration: "underline",
                                      float: "right",
                                      padding: "0rem 0.3rem",
                                    }}
                                    onClick={() => {
                                      this._feedbackSongId = current_song.id;
                                      this.setState({
                                        showSongFeedbackModal: true,
                                      });
                                    }}
                                  >
                                    report issue
                                  </b>
                                )}
                              </div>
                            )}
                            <br />
                            {this.state.showSongFeedbackModal &&
                              this.showFeedbackModal()}
                          </div>
                        </Col>
                      </Row>
                    )}
                    <br />
                    {current_song &&
                      this._showNextSongs &&
                      songsData &&
                      songsData.length != 0 && (
                        <Row>
                          <Col xs={10} xsOffset={1}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <h5>All Songs Info</h5>
                            </div>
                            {songsData.map((x, i) => (
                              <div key={i} className="song-info-css">
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <b>
                                    Song{" "}
                                    {i +
                                      1 +
                                      (totalSongCount - songsData.length) +
                                      "/" +
                                      totalSongCount}{" "}
                                    Info
                                  </b>
                                  {enableNextSongSkip && (
                                    <b
                                      style={{
                                        color: "#ffcb4a",
                                        textDecoration: "underline",
                                      }}
                                      onClick={() =>
                                        this.skipSelectedSong(x.id)
                                      }
                                    >
                                      Skip
                                    </b>
                                  )}
                                </div>
                                <b>Title: </b>
                                {x.title}
                                <br />
                                <b>Artist: </b>
                                {x.artist}
                                <br />
                                <b>Year: </b>
                                {x.year}
                                <br />
                                {(x.additional_data.single_data.length > 0 ||
                                  x.additional_data.double_data.length > 0 ||
                                  x.additional_data.question_answer_data
                                    .length > 0) && (
                                  <div>
                                    <b
                                      onClick={() =>
                                        this.setState({
                                          collapse:
                                            x.id == collapse ? false : x.id,
                                        })
                                      }
                                      style={{
                                        color: "blue",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      Additional Info
                                    </b>
                                    <div>
                                      <SongAdditionalInfo
                                        collapse={collapse}
                                        song={x}
                                        additionalData={x.additional_data}
                                      />
                                    </div>
                                  </div>
                                )}
                                <b style={{ color: "red" }}>ISSUE: </b>
                                {x.issues}
                                {!x.issues && (
                                  <b
                                    style={{
                                      color: "blue",
                                      textDecoration: "underline",
                                      float: "right",
                                      padding: "0rem 0.3rem",
                                    }}
                                    onClick={() => {
                                      this._feedbackSongId = x.id;
                                      this.setState({
                                        showSongFeedbackModal: true,
                                      });
                                    }}
                                  >
                                    report issue
                                  </b>
                                )}
                                <br />
                              </div>
                            ))}
                          </Col>
                        </Row>
                      )}
                  </div>
                )}
                {skipping && <div className="songSkipLoader">Loading...</div>}
              </Col>
            </Row>
            <Row center="xs">
              <div
                className="col-xs-12 col-md-6"
                style={{
                  display: "flex",
                  padding: ".5rem",
                  background: "black",
                  color: "gray",
                }}
              >
                <Col xs>
                  <b>GAME RESCUE</b> - game stuck? try one of these
                </Col>
              </div>
            </Row>
            <Row center="xs">
              <div
                className="col-xs-12 col-md-6"
                style={{
                  display: "flex",
                  paddingBottom: "1rem",
                  background: "black",
                  color: "gray",
                }}
              >
                <Col xs>
                  <a
                    onClick={() => {
                      location.reload();
                    }}
                  >
                    <i className="fa fa-repeat fa-2x" />
                    <br /> 1) REFRESH
                  </a>
                </Col>
                <Col xs>
                  <a
                    onClick={() => {
                      this.reloadGame();
                    }}
                  >
                    <i className="fa fa-refresh fa-2x" />
                    <br /> 2) RECOVER
                  </a>
                </Col>
                <Col xs>
                  <a
                    href={
                      "/config/" +
                      this.props.match.params.game_code +
                      "?continue"
                    }
                    style={{ color: "gray" }}
                    onClick={() => {
                      this.props.dispatch(
                        postRequest("games/update_setting", {
                          values: {
                            game: { code: this.props.match.params.game_code },
                          },
                        })
                      );
                    }}
                  >
                    <i className="fa fa-sign-in fa-2x" />
                    <br /> 3) RECONFIG
                  </a>
                </Col>
                <Col xs>
                  <a
                    onClick={() => {
                      this.resetGame();
                    }}
                  >
                    <i className="fa fa-power-off fa-2x" />
                    <br /> 4) RESET
                  </a>
                </Col>
              </div>
            </Row>
            <Row center="xs">
              <div className="col-xs-12 col-md-6">
                <SpiffReward winner code={this.props.match.params.game_code} />
              </div>
            </Row>
            <Row center="xs">
              <div style={{ display: "flex", padding: "2rem" }}>
                <Col xs={12} start="xs">
                  <a
                    style={{
                      color: "white",
                      background: "red",
                      padding: "1rem",
                      paddingTop: "2rem",
                    }}
                    onClick={() => {
                      this.gameOver();
                    }}
                  >
                    <i className="fa fa-trophy fa-3x" /> END GAME
                  </a>
                </Col>
              </div>
            </Row>
            <Row>
              <Col xs={12} md={8} mdOffset={2} style={{ padding: "0rem" }}>
                <div style={{ color: "white" }}>
                  refresh screen to update scores
                </div>
                {songWinners && (
                  <LeaderBoardTable songWinners itemsArray={songWinners} />
                )}
              </Col>
            </Row>
            <br />
            <Row>
              <Col xs={12} md={8} mdOffset={2} style={{ padding: "0rem" }}>
                {leaderboard && <LeaderBoardTable itemsArray={leaderboard} />}
              </Col>
            </Row>
          </div>
        )}
        {!nextRound && triviaMode && (
          <div>
            <Col xs={10} xsOffset={1} id="SlideControl">
              <Row>
                <Col xs={6}>
                  <h5>Game Control</h5>
                </Col>
                <Col xs={6} style={{ color: "#ffca27" }}>
                  <div>
                    <a
                      style={{ float: "right" }}
                      onClick={() => {
                        this.setState({ showChatModal: true });
                      }}
                    >
                      <i className="fa fa-comments-o" aria-hidden="true"></i>{" "}
                      Game Chat
                    </a>
                  </div>
                </Col>
              </Row>
              <Row center="xs">
                <div style={{ display: "flex", margin: "2rem" }}>
                  <Col xs>
                    {" "}
                    <Button
                      style={{
                        backgroundColor: "transparent",
                        borderColor: "transparent",
                      }}
                      className="mayhem-btn-yellow"
                      onClick={() => {
                        this.showSlides("allowPlayerGuess");
                        this.showSlides("incrementSlide");
                      }}
                    >
                      Next Question
                    </Button>
                  </Col>
                </div>
                <br />
              </Row>{" "}
            </Col>
            <Row>
              <Col xs={10} xsOffset={1}>
                <div
                  style={{
                    paddingBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <a
                    style={{ color: "orange" }}
                    onClick={() => {
                      this.showSlides("decrementSlide");
                    }}
                  >
                    SLIDE <i className="fa fa-step-backward" />
                  </a>
                  <a
                    style={{ color: "orange" }}
                    onClick={() => {
                      this.showSlides("allowPlayerGuess");
                    }}
                  >
                    <i className="fa fa-comment" /> NEW GUESS
                  </a>
                  <a
                    style={{ color: "orange" }}
                    onClick={() => {
                      this.showSlides("incrementSlide");
                    }}
                  >
                    <i className="fa fa-step-forward" /> SLIDE
                  </a>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={10} xsOffset={1}>
                <div
                  style={{
                    paddingBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <a
                    style={{ color: "gray" }}
                    onClick={() => this.playerAnswer()}
                  >
                    <i className="fa fa-book" /> SEE ANSWERS
                  </a>
                  <a
                    style={{ color: "gray" }}
                    onClick={() => this.ticketScore()}
                  >
                    <i className="fa fa-ticket" /> TICKET SCORE
                  </a>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={10} xsOffset={1}>
                <div
                  style={{
                    paddingBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <a
                    style={{ color: "red", textAlign: "center" }}
                    onClick={() => {
                      this.resetGame();
                    }}
                  >
                    <i className="fa fa-recycle" /> RESET GAME
                  </a>
                  {this.props &&
                    this.props.game &&
                    this.props.game.game &&
                    this.props.game.game.session_id && (
                      <a
                        style={{
                          color: "yellow",
                          border: "1px solid yellow",
                          textAlign: "center",
                        }}
                        onClick={() => {
                          this.setState({ nextRound: true });
                          this.props.dispatch(
                            addNewRound({
                              game: {
                                code: this.props.match.params.game_code,
                                round_mode: "multi",
                              },
                            })
                          );
                        }}
                      >
                        <i className="fa fa-plus-circle" /> ADD ROUND
                      </a>
                    )}

                  <a
                    style={{ color: "red", textAlign: "center" }}
                    onClick={() => {
                      this.gameOver();
                    }}
                  >
                    <i className="fa fa-trophy" /> END GAME
                  </a>
                </div>
              </Col>
            </Row>
            <Row center="xs">
              {showBackgroundCheckbox && (
                <div>
                  <div
                    className="remember-me"
                    onClick={() => {
                      this.setState({
                        backgroundMusic: !this.state.backgroundMusic,
                      });
                    }}
                  >
                    <div>
                      {backgroundMusic && (
                        <i style={{ color: "white" }} className="fa fa-check" />
                      )}{" "}
                    </div>
                    <label style={{ color: "#fff" }}>
                      BACKGROUND MUSIC VOLUME
                    </label>
                  </div>
                  {backgroundMusic && (
                    <Row center="xs">
                      <div style={{ display: "flex" }}>
                        <Col xs={6} sm={6}>
                          {" "}
                          <Button
                            className="mayhem-btn-yellow"
                            style={{ width: "12vmax", float: "right" }}
                            onClick={() => {
                              this.volumeButton("bcg_up");
                            }}
                          >
                            {" "}
                            Vol +{" "}
                          </Button>
                        </Col>
                        <Col xs={6} sm={6}>
                          {" "}
                          <Button
                            className="mayhem-btn-yellow"
                            style={{ width: "12vmax" }}
                            onClick={() => {
                              this.volumeButton("bcg_down");
                            }}
                          >
                            Vol -{" "}
                          </Button>
                        </Col>
                      </div>
                      <br />
                    </Row>
                  )}
                </div>
              )}
            </Row>
          </div>
        )}
        {!nextRound && mayhemMatesMode && (
          <div>
            <Col xs={12} md={8} mdOffset={2} id="MayhemMatesControl">
              <Row>
                <Col xs={6}>
                  <h5>Game Control</h5>
                </Col>
                <Col xs={6} style={{ color: "#ffca27" }}>
                  <div>
                    <a
                      style={{ float: "right" }}
                      onClick={() => {
                        this.setState({ showChatModal: true });
                      }}
                    >
                      <i className="fa fa-comments-o" aria-hidden="true"></i>{" "}
                      Game Chat
                    </a>
                  </div>
                </Col>
              </Row>
              <Row center="xs">
                <div style={{ display: "flex", margin: "2rem" }}>
                  <Col xs>
                    {" "}
                    <Button
                      style={{
                        backgroundColor: "transparent",
                        borderColor: "transparent",
                      }}
                      className="mayhem-btn-yellow"
                      onClick={() => {
                        this.setState({ nextRound: true });
                        this.props.dispatch(
                          addNewRound({
                            game: {
                              code: this.props.match.params.game_code,
                              round_mode: "multi",
                            },
                          })
                        );
                      }}
                    >
                      ADD ROUND
                    </Button>
                  </Col>
                </div>
                <br />
              </Row>{" "}
            </Col>
            <Row>
              <Col xs={10} xsOffset={1}>
                <div
                  style={{
                    paddingBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <a
                    style={{ color: "red" }}
                    onClick={() => {
                      this.resetGame();
                    }}
                  >
                    <i className="fa fa-recycle" /> RESET GAME
                  </a>
                  <a
                    style={{ color: "red" }}
                    onClick={() => {
                      this.gameOver();
                    }}
                  >
                    <i className="fa fa-trophy" /> END GAME
                  </a>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {!nextRound &&
          triviaMode &&
          this._playerAnswers &&
          playerAnswerRecieved && (
            <div
              style={{
                padding: "1rem",
                margin: "1vh 5vw",
                backgroundColor: "white",
              }}
            >
              <h3
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0",
                  fontSize: "2.2vmax",
                }}
                className="max-answer-font-head font-light"
              >
                Player Answers
                <a
                  className="font-light"
                  onClick={() => this.playerAnswer()}
                  style={{ float: "right", color: "blue" }}
                >
                  <i className="fa fa-refresh 2x" /> REFRESH ANSWERS
                </a>
              </h3>
              <Container
                style={{
                  borderTop: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  padding: "1.5rem 0.5rem",
                  overflowX: "scroll",
                  overflowY: "hidden",
                }}
              >
                {this._playerAnswers &&
                  this._playerAnswers.length != 0 &&
                  Object.entries(this._playerAnswers).map((x, i) => (
                    <div key={i}>
                      {" "}
                      <Row>
                        <Col xs={1} style={{ textAlign: "center" }}>
                          <p
                            style={{ color: "#210344", fontSize: "1.5vmax" }}
                            className="max-answer-font"
                          >
                            Q
                          </p>
                        </Col>
                        <Col xs={5} style={{ textAlign: "left" }}>
                          <p
                            style={{ color: "#210344", fontSize: "1.5vmax" }}
                            className="max-answer-font"
                          >
                            Name
                          </p>
                        </Col>
                        <Col xs={3} style={{ textAlign: "left" }}>
                          <p
                            style={{ color: "#210344", fontSize: "1.5vmax" }}
                            className="max-answer-font"
                          >
                            Answer
                          </p>
                        </Col>
                        <Col xs={1} style={{ textAlign: "left" }}>
                          <p
                            style={{ color: "#210344", fontSize: "1.5vmax" }}
                            className="max-answer-font"
                          >
                            Ticket
                          </p>
                        </Col>
                      </Row>
                      <div>
                        {" "}
                        {x[1].map((y, j) => (
                          <span key={j}>
                            {((j > 0 &&
                              y.question_number !=
                                x[1][j - 1].question_number) ||
                              j == 0) && <hr />}
                            <Row>
                              <Col
                                xs={1}
                                style={{
                                  textAlign: "center",
                                  color: "green",
                                  padding: "3px",
                                }}
                              >
                                <p
                                  style={{ fontSize: "1.5vmax" }}
                                  className="max-answer-font"
                                >
                                  {j > 0 &&
                                  y.question_number !=
                                    x[1][j - 1].question_number
                                    ? y.question_number + "."
                                    : j == 0
                                    ? y.question_number + "."
                                    : " "}
                                </p>
                              </Col>
                              <Col
                                xs={5}
                                style={{
                                  textAlign: "left",
                                  color: "#888",
                                  padding: "3px",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: "1.5vmax",
                                    wordBreak: "break-all",
                                  }}
                                  className="max-answer-font"
                                >
                                  {y.p_name}
                                </p>
                              </Col>
                              <Col
                                xs={3}
                                style={{
                                  textAlign: "left",
                                  color: "red",
                                  padding: "3px",
                                }}
                              >
                                <p
                                  style={{
                                    fontSize: "1.5vmax",
                                    wordBreak: "break-all",
                                  }}
                                  className="max-answer-font"
                                >
                                  {y.answer}
                                </p>
                              </Col>
                              <Col xs={1} style={{ textAlign: "left" }}>
                                <button
                                  onClick={() => this.sendTicketReward(y)}
                                  className="sendTicketButton max-answer-font"
                                >
                                  AWARD
                                </button>
                              </Col>
                            </Row>{" "}
                          </span>
                        ))}{" "}
                      </div>{" "}
                    </div>
                  ))}
              </Container>
            </div>
          )}
        {!nextRound &&
          triviaMode &&
          this._ticketScore &&
          ticketScoreRecieved && (
            <div
              style={{
                padding: "1rem",
                margin: "1vh 5vw",
                backgroundColor: "white",
              }}
            >
              <h3
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0",
                  fontSize: "2.2vmax",
                }}
                className="max-answer-font-head font-light"
              >
                Player Ticket Score
                <a
                  className="font-light"
                  onClick={() => this.ticketScore()}
                  style={{ float: "right", color: "blue" }}
                >
                  <i className="fa fa-refresh" /> REFRESH
                </a>
              </h3>
              <Container
                style={{
                  borderTop: "1px solid #ddd",
                  borderBottom: "1px solid #ddd",
                  padding: "1.5rem 0.5rem",
                  overflow: "hidden",
                }}
              >
                {this._ticketScore && this._ticketScore.length != 0 && (
                  <div>
                    {" "}
                    <Row>
                      <Col xs={3} style={{ textAlign: "center" }}>
                        <p
                          style={{ color: "#210344", fontSize: "1.5vmax" }}
                          className="max-answer-font"
                        >
                          Rank
                        </p>
                      </Col>
                      <Col xs={6} style={{ textAlign: "center" }}>
                        <p
                          style={{ color: "#210344", fontSize: "1.5vmax" }}
                          className="max-answer-font"
                        >
                          Name
                        </p>
                      </Col>
                      <Col xs={3} style={{ textAlign: "center" }}>
                        <p
                          style={{ color: "#210344", fontSize: "1.5vmax" }}
                          className="max-answer-font"
                        >
                          Total Tickets
                        </p>
                      </Col>
                    </Row>
                    <div>
                      {" "}
                      {this._ticketScore.map((x, i) => (
                        <span key={i}>
                          <Row center="xs">
                            <Col
                              xs={3}
                              style={{ textAlign: "center", color: "green" }}
                            >
                              <p
                                style={{ fontSize: "1.5vmax" }}
                                className="max-answer-font"
                              >
                                {i + 1}
                              </p>
                            </Col>
                            <Col
                              xs={6}
                              style={{ textAlign: "center", color: "green" }}
                            >
                              <p
                                style={{ fontSize: "1.5vmax" }}
                                className="max-answer-font"
                              >
                                {x.name}
                              </p>
                            </Col>
                            <Col
                              xs={3}
                              style={{ textAlign: "center", color: "green" }}
                            >
                              <p
                                style={{
                                  fontSize: "1.5vmax",
                                  wordBreak: "break-all",
                                }}
                                className="max-answer-font"
                              >
                                {x.total_tickets}
                              </p>
                            </Col>
                          </Row>{" "}
                        </span>
                      ))}{" "}
                    </div>{" "}
                  </div>
                )}
              </Container>
            </div>
          )}
      </Container>
    );
  }
}

const FeedbackForm = reduxForm({
  form: "FeedbackForm",
})(GameRemote);

function mapStateToProps(store) {
  return {
    auth: store.auth,
    game: store.game,
  };
}

export default connect(mapStateToProps)(FeedbackForm);
