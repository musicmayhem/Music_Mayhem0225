/*global setTimeout localStorage*/
import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import Timer from '../Timer'
import Trophy from '../../images/Trophy.svg'
import ListColored from '../ListColored'
import SessionLeaderboard from '../SessionLeaderboard'

class MirrorFinalLeaderboard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameOverDisplayTime: props.settings ? 0.0166666667 * props.settings.game_over_display_time : 1,
      leaderboardData: props.leaderboard,
      showWinner: false,
    }
  }

  UNSAFE_componentWillMount() {
    setTimeout(() => {
      this.setState({ showWinner: true })
    }, 1000)
    localStorage.removeItem('indexImg')
  }

  sortDesc = (a, b) => {
    if (a.total_score > b.total_score) return -1
    if (a.total_score < b.total_score) return 1
    return 0
  }

  render() {
    const gameLeaders = this.state.leaderboardData
    const showWinner = this.state.showWinner
    const { openSession, jukeboxMode, autoRoundAdvance, code, game_code_display, gameOverLeaderboard } = this.props
    return (
      <div style={{ color: '#fff' }}>
        <div className="yellow-header">
          <Row>
            <div style={{ textAlign: 'left', justifyContent: 'left', zIndex: 99 }} className="timer">
              GOMAYHEM.COM
              {game_code_display && <b>{' code: '+code}</b>}
            </div>
            <div className="timer">
              {!openSession && (
                <Timer time={this.state.gameOverDisplayTime} data={'Next game will start in'} position="top" />
              )}
              {openSession && jukeboxMode && (
                <Timer time={this.state.gameOverDisplayTime} data={'Next game will start in'} position="top" />
              )}
              {openSession && autoRoundAdvance && (
                <Timer time={this.state.gameOverDisplayTime} data={'Next Round will start in'} position="top" />
              )}
            </div>
            <div />
          </Row>
        </div>
        <Row center="xs" top="xs">
          {gameOverLeaderboard && (
            <Col xs={12} md={6} style={{ margin: '2rem 0', padding: '0 2rem', textAlign: 'left' }}>
              {!openSession && gameLeaders && <ListColored gameLeaders={gameLeaders} />}
              {openSession && <SessionLeaderboard gameLeaders={gameLeaders} />}
            </Col>
          )}
          <Col xs={12} md={gameOverLeaderboard ? 6 : 12 } style={{ paddingTop: '5rem' }}>
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
                  {openSession ? 'SESSION WINNER' : 'GAME WINNER'}
                </h1>
                {openSession && (
                  <p className="winner-name" style={{ fontSize: '2.8vw' }}>
                    {gameLeaders && gameLeaders.length > 0 && gameLeaders && gameLeaders[0][0]}
                  </p>
                )}
                {!openSession && (
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

export default connect(state => {
  return {
    auth: state.auth,
  }
})(MirrorFinalLeaderboard)
