/*global document setTimeout */
import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { checkUserIsLogin } from '../actions/loginActions'
import { connect } from 'react-redux'
import { updateGameRequest, addNewRound } from '../actions/hostGameActions'
import ListColored from './ListColored'
import Timer from './Timer'
import ListNormal from './ListNormal'
import { postRequest } from '../actions/gameAction'
import { songFadeOut } from '../components/helper'

class Leaderboard extends React.Component {
  state = {
    showInfoSong: false,
    showListNormal: false,
    showListColored: false,
    displayTime:
      this.props.game && this.props.game.game ? this.props.game.rounds.settings.leaderboard_display_time * 1000 : 5000,
  }

  UNSAFE_componentWillMount() {
    this._gameLeaders = this.props.leaderboard
    this._songLeaders = this.props.currentSongScores
    if (this.props.automaticSongAdvance) {
      setTimeout(() => {
        this.sendNextEvent()
      }, this.state.displayTime)
    }
    if(!this.props.mirror){
      this.props.checkUserIsLogin().then(res => {
        if (!res) window.location = '/login'
      })
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ showInfoSong: true })
      setTimeout(() => {
        this.setState({ showListNormal: true })
        setTimeout(() => {
          this.setState({ showListColored: true })
        }, 1000)
      }, 0)
    }, 1000)
  }

  manuallySendPusherEvent() {
    if (document.getElementById('next-song-btn')) document.getElementById('next-song-btn').style.display = 'none'
    this.sendNextEvent()
  }

  sendNextEvent() {
    songFadeOut()
    setTimeout(() => {
      let element = document.getElementById('songPlayer')
      if (element) element.parentNode.removeChild(element)
    }, 11000)
    if(!this.props.mirror){
      if (this.props.openSession && this.props.lastSongOfGame) {
        if (this.props.game.game.automatic_round_advance)
        this.props.addNewRound({ game: { code: this.props.game.game.code } })
        if (this.props.game.game.jukebox_mode) {
          this.props.postRequest('games/pusher_update', {
            values: { game: { code: this.props.game.game.code, status: 'askPlayerContinue' } },
          })
        }
      } else if (!this.props.openSession && this.props.lastSongOfGame) {
        this.props.postRequest('games/pusher_update', {
          values: { game: { code: this.props.game.game.code, status: 'gameOver' } },
        })
      } else {
        setTimeout(() => {
          this.props.updateGameRequest({ state: 'Song Ended', code: this.props.game.game.code })
        }, 11000)
      }
    }
  }

  sortDesc = (a, b) => {
    if (a.total_score > b.total_score) return -1
    if (a.total_score < b.total_score) return 1
    return 0
  }

  _gameLeaders = null
  _songLeaders = null

  render() {
    const { player1, player11, lastSongOfGame, gameCode, game, openSession, game_code_display, round_leaderboard } = this.props
    const gameLeaders = this.props.leaderboard || this._gameLeaders
    const songLeaders = this.props.currentSongScores || this._songLeaders
    return (
      <div style={{ color: '#fff' }}>
        {lastSongOfGame && (
          <div className="yellow-header">
            <Row>
              <div style={{ textAlign: 'left', justifyContent: 'left', zIndex: 99 }} className="timer">
                GOMAYHEM.COM
                {game_code_display && <b>{' code: '+gameCode}</b>}
              </div>
              <div className="timer">
                {game.game.open_session && game.game.automatic_round_advance && (
                  <Timer time={0.5} data={'Next Round will start in'} position="top" />
                )}
              </div>
              <div />
            </Row>
          </div>
        )}
        {!lastSongOfGame && (
          <div className="yellow-header">
            <div>
            GOMAYHEM.COM {game_code_display && <b>{'code: '+gameCode}</b>}
            </div>
            <div />
          </div>
        )}

        <Row
          center="xs"
          style={{ borderBottom: '1px solid #210345', textAlign: 'left' }}
          className={this.state.showInfoSong ? 'animated-song-name animate-song-name' : 'animated-song-name'}
        >
          <Col xs={12} md={11} style={{ margin: '2rem 0' }}>
            <h3 style={{ lineHeight: '1', fontWeight: '600', fontSize: '4vh', fontStyle: 'italic' }}>
              {this.props.songCount || 'No Data'}
            </h3>
            <h2 style={{ lineHeight: '1', fontWeight: '600', fontSize: '5vh' }}>
              {this.props.loadedSong ? this.props.loadedSong.title : 'No title'} by{' '}
              {this.props.loadedSong ? this.props.loadedSong.artist : 'No artist'} {' '}
              ({this.props.loadedSong ? this.props.loadedSong.year : ''})
            </h2>
          </Col>
        </Row>
        <Row center="xs">
          <Col
            xs={12}
            md={6}
            style={{ margin: '2rem 0', padding: '0 2rem', borderRight: '1px solid #210345', textAlign: 'left' }}
          >
            {this.state.showListNormal && (
              <ListNormal songLeaders={songLeaders} player1={player1} player11={player11} session={openSession} />
            )}
          </Col>
          <Col xs={12} md={6} style={{ margin: '2rem 0', padding: '0 2rem', textAlign: 'left' }}>
            {this.state.showListColored && round_leaderboard && gameLeaders && <ListColored gameLeaders={gameLeaders} session={openSession} />}
          </Col>
        </Row>
        {!this.props.automaticSongAdvance && (
          <Row center="xs">
            <button
              id="next-song-btn"
              className="mayhem-link-light"
              onClick={() => {
                this.manuallySendPusherEvent()
              }}
            >
              Start Next Song
            </button>
          </Row>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    updateGameRequest: params => dispatch(updateGameRequest(params)),
    addNewRound: params => dispatch(addNewRound(params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      game: state.game,
    }
  },
  mapDispatchToProps
)(Leaderboard)
