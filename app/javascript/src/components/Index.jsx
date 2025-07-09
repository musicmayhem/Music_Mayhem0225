import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import CompletedGames from './CompletedGames'
import UserPicture from './UserPicture'
import { checkUserIsLogin } from '../actions/loginActions'
import GameCodeChecker from './GameCodeChecker'
import Loader from './Loader'
import { makeRequest, postRequest } from '../actions/gameAction'
import { createGame } from '../actions/hostGameActions'
import { GET_INDEX_DATA_SUCCESS } from '../constants/indexConstants'
import Spiffs from '../components/PPTS/Spiffs'

let gameWindow = null

class Main extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
    accountRole: null,
    clicked: true,
  }

  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) {
        this.props.history.push('/')
      } else {
        this.setState({ accountRole: res.account.role })
        this.props.makeRequest('games/get_index_data', { type: GET_INDEX_DATA_SUCCESS })
      }
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.game.indexPage &&
      !nextProps.game.header &&
      this.state.clicked &&
      nextProps.game &&
      nextProps.game.game &&
      nextProps.game.game.code
    ) {
      const game_code = nextProps.game.game.code
      gameWindow.location = '/games/' + game_code
      window.location = '/config/' + game_code
      this.setState({ clicked: false })
    }
  }

  createHostedGame() {
    gameWindow = window.open(
      '/loader',
      '_blank',
      'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=9999, height=9999'
    )
    let values = {
      game: {
        game_mode: 'multi',
        timer: '1 minute',
        playlist_id: '658',
        profile_id: 3,
        background_music: true,
        automatic_song_advance: true,
        profile: 'Default',
        splash_url:
          'https://docs.google.com/presentation/d/e/2PACX-1vTOQ4M2SipxUeTqICILKIFKrZpvtpkgG7fQ99QdvapeJqmoTzXHqCM0al9FeU11TJwcWUMyIiDi255U/embed?start=true&loop=false&delayms=3000',
        enable_splash: true,
        profile_data: {
          automatic_song_advance: true,
          background_music: true,
          game_over_display_time: 30,
          guess_timer: 60,
          id: 3,
          leaderboard_display_time: 30,
          name: 'Default',
          point_value: 100,
          song_count: 11,
          song_play_time: 60,
        },
      },
    }
    localStorage.removeItem('game_config_updated')
    localStorage.removeItem('game_updated')
    this.props.createGame(values)
  }

  render() {
    let str = 'MY \n' + 'MAYHEM \n' + 'SPIFFS \n'
    const { username, logo, played_games, avg_points, games_won, points } = this.props.index
    let user = {
      avatar: logo,
      username: username,
    }

    return (
      <Container>
        {!this.props.index.getting_data && <Loader />}
        {this.props.index.getting_data && (
          <Row center="xs">
            <Col xs={12} style={{ padding: 0 }}>
              <GameCodeChecker changedButtonText={'JOINING...'} buttonText={'JOIN'} {...this.props} />
              <div style={{ marginTop: '10rem', background: 'white' }}>
                <UserPicture user={user} />
                <Container style={{ background: 'white' }}>
                  <Row
                    center="xs"
                    style={{ borderBottom: '1px solid #aaa', borderTop: '1px solid #aaa', margin: '0 0.8rem' }}
                  >
                    <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                      <p className="property-value">{points}</p>
                      <p className="property-name">
                        Total <br /> Points
                      </p>
                    </Col>
                    <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                      {played_games && (<p className="property-value">{played_games.length}</p>)}
                      <p className="property-name">
                        Games <br /> Played
                      </p>
                    </Col>
                    <Col xs={4} className="col-pad-y">
                      <p className="property-value">{games_won}</p>
                      <p className="property-name">
                        Games /<br /> Won
                      </p>
                    </Col>
                  </Row>
                </Container>
                <div style={{ background: 'white', padding: '1rem' }}>
                  <a href="/career" className="mayhem-link">
                    view my career
                  </a>
                </div>
                <div className="plan-container">
                  <h3 className="font-light">{str}</h3>
                  <Spiffs indexPage={true} model {...this.props} pageState={p => this.setState({ reward: p })} />
                </div>

                {this.state.accountRole == 'host' && (
                  <div style={{ borderBottom: '1px solid #aaa', background: 'white', padding: '1rem' }} />
                )}
                <CompletedGames played_games={played_games} />
              </div>
            </Col>
          </Row>
        )}
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    createGame: params => dispatch(createGame(params)),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      index: state.index,
      game: state.game,
      account: state.account,
    }
  },
  mapDispatchToProps
)(Main)
