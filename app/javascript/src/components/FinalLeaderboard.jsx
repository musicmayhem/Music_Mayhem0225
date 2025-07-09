/*global setTimeout localStorage*/
import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { checkUserIsLogin } from '../actions/loginActions'
import { connect } from 'react-redux'
import { startNewGame, getLeaderBoards, addNewRound } from '../actions/hostGameActions'
import Timer from './Timer'
import Trophy from '../images/Trophy.svg'
import ListColored from './ListColored'
import SessionLeaderboard from './SessionLeaderboard'

class FinalLeaderboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameOverDisplayTime: this.props.game.rounds
        ? 0.0166666667 * this.props.game.rounds.settings.game_over_display_time
        : 1,
      startGameTime: this.props.game.rounds ? this.props.game.rounds.settings.game_over_display_time * 1000 : 1000,
      leaderboardData: null,
      showWinner: false,
    }
  }

  UNSAFE_componentWillMount() {
    setTimeout(() => {
      this.setState({ showWinner: true })
    }, 1000)
    this.props.getLeaderBoards({ game: { code: this.props.game.game.code } }).then(res => {
      this.setState({ leaderboardData: res.leaderboard })
    })
    localStorage.removeItem('indexImg')
    if (!this.props.game.game.open_session) {
      setTimeout(() => {
        this.props.startNewGame({ game: { code: this.props.game.game.code } })
      }, this.state.startGameTime)
    } else if (this.props.game.game.open_session && this.props.game.game.jukebox_mode) {
      setTimeout(() => {
        this.props.startNewGame({ game: { code: this.props.game.game.code } })
      }, this.state.startGameTime)
    } else {
      if (this.props.game.game.automatic_round_advance) {
        setTimeout(() => {
          this.props.addNewRound({ game: { code: this.props.game.game.code } })
        }, 31000)
      }
    }

    this.props.checkUserIsLogin().then(res => {
      if (!res) window.location = '/login'
    })
  }

  sortDesc = (a, b) => {
    if (a.total_score > b.total_score) return -1
    if (a.total_score < b.total_score) return 1
    return 0
  }

  render() {
    const gameLeaders = this.state.leaderboardData
    const showWinner = this.state.showWinner
    const showOpenSessionScores = this.props.game.game && this.props.game.game.open_session
    const game_code_display = this.props.game.game && this.props.game.game.game_code_display
    const gameOverLeaderboard = this.props.game.game && this.props.game.game.game_over_leaderboard
    return (
      <div style={{ color: '#fff' }}>
        <div className="yellow-header">
          <Row>
            <div style={{ textAlign: 'left', justifyContent: 'left', zIndex: 99 }} className="timer">
              GOMAYHEM.COM
              {game_code_display && <b>{' code: '+this.props.gameCode}</b>}
            </div>
            <div className="timer">
              {!this.props.game.game.open_session && (
                <Timer time={this.state.gameOverDisplayTime} data={'Next game will start in'} position="top" />
              )}
              {this.props.game.game.open_session && this.props.game.game.jukebox_mode && (
                <Timer time={this.state.gameOverDisplayTime} data={'Next game will start in'} position="top" />
              )}
              {this.props.game.game.open_session && this.props.game.game.automatic_round_advance && (
                <Timer time={this.state.gameOverDisplayTime} data={'Next Round will start in'} position="top" />
              )}
            </div>
            <div />
          </Row>
        </div>
        <Row center="xs" top="xs">
          {gameOverLeaderboard && (
            <Col xs={12} md={6} style={{ margin: '2rem 0', padding: '0 2rem', textAlign: 'left' }}>
              {!showOpenSessionScores && gameLeaders && <ListColored gameLeaders={gameLeaders} />}
              {showOpenSessionScores && <SessionLeaderboard gameLeaders={gameLeaders} />}
            </Col>
          )}
          <Col xs={12} md={ gameOverLeaderboard ? 6 : 12 } style={{ paddingTop: '5rem' }}>
            <Row center="xs" top="xs">
              <Col
                xs={12}
                className={showWinner ? 'winner-animation-div show-animation-winner' : 'winner-animation-div'}
              >
                <img src={Trophy} width="100px" />
                <h1
                  style={{ color: '#ffca27', fontWeight: '600', marginTop: '20px', marginBottom: '-10px' }}
                  className="game-winner"
                >
                  {showOpenSessionScores ? 'SESSION WINNER' : 'GAME WINNER'}
                </h1>
                {showOpenSessionScores  && (
                  <p className="winner-name" style={{ fontSize: '2.8vw' }}>
                    {gameLeaders && gameLeaders.length > 0 && gameLeaders && gameLeaders[0][0]}
                  </p>
                )}
                {!showOpenSessionScores && (
                  <p className="winner-name" style={{ fontSize: '2.8vw' }}>
                    {gameLeaders && gameLeaders.length > 0 && gameLeaders && gameLeaders.sort(this.sortDesc)[0].name}
                  </p>
                )}
                {gameLeaders && gameLeaders.length > 0 && (
                  <div className="profile-pic">
                    <img
                      src={
                        gameLeaders.sort(this.sortDesc)[0].logo ||
                        'https://i1.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?fit=256%2C256&quality=100&ssl=1'
                      }
                      alt="Users Profile"
                      width="130px"
                      height="130px"
                      style={{
                        backgroundColor: 'white',
                        transform: 'translateX(0)',
                        borderRadius: '50%',
                        border: '2px solid #fff',
                      }}
                    />
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    startNewGame: params => dispatch(startNewGame(params)),
    getLeaderBoards: params => dispatch(getLeaderBoards(params)),
    addNewRound: params => dispatch(addNewRound(params)),
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
)(FinalLeaderboard)
