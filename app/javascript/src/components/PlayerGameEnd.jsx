/* global localStorage document*/
/* global document */
import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import SongPicture from './SongPicture'
import LeaderBoardTable from './LeaderBoardTable'
import Timer from './Timer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Modal from 'react-responsive-modal'
import { POSTING } from '../constants/routeConstants'
import { deviseRequest } from '../actions/gameAction'
import Swal from 'sweetalert2'

class PlayerGameEnd extends React.Component {
  state = {
    open: false,
    gameOverDisplayTime: 0.0166666667 * this.props.gameOverTime,
  }

  UNSAFE_componentWillMount() {
    localStorage.removeItem('answered')
    if (!this.props.guest) this.setState({ open: true })
  }

  componentDidMount() {
    localStorage.removeItem('game_config_updated')
    document.getElementsByClassName('nav-bar-hamburger')[0].style.zIndex = '101'
    document.getElementsByClassName('nav-bar-content')[0].style.zIndex = '99'
  }
  componentWillUnmount() {
    document.getElementsByClassName('nav-bar-hamburger')[0].style.zIndex = 'auto'
    document.getElementsByClassName('nav-bar-content')[0].style.zIndex = '99'
  }

  sendConfirmationMail = () => {
    this.setState({ open: false })
    this.props.dispatch(deviseRequest('/resend_confirmation', { type: POSTING }))
    Swal({
      type: 'success',
      title: 'Please check your email!',
      showConfirmButton: false,
      timer: 1500,
    })
  }

  render() {
    const { open } = this.state
    const player = this.props.player
    const songDetails = this.props.songDetails
    const points_earned =
      this.props.guess.guessData && this.props.guess.guessData
        ? this.props.guess.guessData.artist_score + this.props.guess.guessData.title_score
        : 0
    const rank = this.props.leaderboard  && this.props.leaderboard.map(x => x && x.id === player.id).indexOf(true) + 1
    const total_score = this.props.guess.total_score ? this.props.guess.total_score : 0
    const leaderboard_data = this.props.leaderboard && this.props.leaderboard[0] && !Array.isArray(this.props.leaderboard[0]) && this.props.leaderboard

    return (
      <Container>
        <Modal open={open} onClose={() => this.setState({ open: false })} center>
          <div style={{ textAlign: 'center', margin: '30px' }}>
            <Row middle="xs" center="xs">
              <p style={{ fontSize: '1rem', textAlign: 'center', color: '#4b4f63' }}>
                <b style={{ fontSize: '1.3rem' }}>
                  Great game,
                  <i style={{ color: 'rgba(30, 178, 228,1.00)' }}>{player.name}!</i>
                </b>
              </p>
              <p style={{ fontSize: '1rem', textAlign: 'center', color: '#4b4f63' }}>
                NOTE: Unconfirmed accounts are only saved for 24 hours. To save scores and customize your profile,
                simply confirm your email. It's fast, secure and FREE!
              </p>
            </Row>
            <hr style={{ marginTop: '-0.5rem', border: '2px solid #1eb2e4' }} />
            <Row middle="xs" center="xs">
              <button onClick={() => this.sendConfirmationMail()} className="customSwalBtn">
                Confirm My Email
              </button>
            </Row>
            <br />
            <Row middle="xs" center="xs">
              <button className="customSwalBtn" onClick={() => window.open('/accounts/setting', '_blank')}>
                Review My Account
              </button>
            </Row>
            <br />
            <Row middle="xs" center="xs">
              <button className="customSwalBtn" onClick={() => this.setState({ open: false })}>
                Keep Playing
              </button>
            </Row>
          </div>
        </Modal>

        <Row center="xs">
          {!this.props.game.open_session && (
            <div className="yellow-header">
              <Timer time={this.state.gameOverDisplayTime} data={'Next game will start in'} position="top" />
              <div />
            </div>
          )}
          {this.props.game.open_session && this.props.game.automatic_round_advance && (
            <div className="yellow-header">
              <Timer time={this.state.gameOverDisplayTime} data={'Next Round will start in'} position="top" />
              <div />
            </div>
          )}

          <Col xs={12} style={{ padding: 0 }}>
            <div style={{ marginTop: '11rem', background: 'white' }}>
              <SongPicture
                song={{
                  url: songDetails.itunes_artwork_url
                    ? songDetails.itunes_artwork_url
                    : 'http://dalelyles.com/musicmp3s/no_cover.jpg',
                  name: songDetails.title,
                  artist: songDetails.artist,
                }}
              />
              <Container style={{ background: 'white' }}>
                <Row
                  center="xs"
                  style={{ borderBottom: '1px solid #aaa', borderTop: '1px solid #aaa', margin: '0 0.8rem' }}
                >
                  <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                    <p className="property-value">{points_earned}</p>
                    <p className="property-name">
                      Points Earned <br />
                      This Round
                    </p>
                  </Col>
                  <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                    <p className="property-value">{total_score}</p>
                    <p className="property-name">
                      Total Points <br />
                      This Round
                    </p>
                  </Col>
                  <Col xs={4} className="col-pad-y">
                    <p className="property-value">{rank}</p>
                    <p className="property-name">
                      Round
                      <br />
                      Rank
                    </p>
                  </Col>
                </Row>
              </Container>
              <Link to="/index">
                <div
                  style={{
                    color: 'rgb(255, 255, 255)',
                    background: 'rgb(33, 3, 68)',
                    display: 'inline-block',
                    padding: '1rem 1rem',
                    margin: '2rem auto',
                    marginBottom: '0',
                  }}
                >
                  GAME OVER
                </div>
              </Link>
              { leaderboard_data && ( <LeaderBoardTable final highlightUser={player.name} itemsArray={leaderboard_data} /> )}
              <h3 className="font-light">Share This Game</h3>
              <div className="nav-bar-content-social" style={{ position: 'relative', top: 0, left: 0 }}>
                <a style={{ color: '#fff' }}>
                  <i className="fa fa-facebook" />
                </a>
                <a style={{ color: '#fff' }}>
                  <i className="fa fa-twitter" />
                </a>
              </div>
              <br />
              <a className="pink-link">Stop Playing</a>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }
}

function mapStateToProps(store) {
  return {
    guess: store.guess,
  }
}

export default connect(mapStateToProps)(PlayerGameEnd)
