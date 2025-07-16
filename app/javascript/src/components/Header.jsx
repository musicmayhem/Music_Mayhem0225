/* global localStorage document window */
import React from 'react'
import { logoutUser } from '../actions/loginActions'
import { connect } from 'react-redux'
import { makeRequest, postRequest } from '../actions/gameAction'
import { START_DEMO_GAME_FROM_HEADER, CREATE_GAME_FROM_HEADER } from '../constants/gameConstants'
import { Link } from "react-router-dom";
let gameWindow = null
let redirectWindow = null
class Example extends React.Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleOutsideClick = this.handleOutsideClick.bind(this)
    this.state = {
      isOpen: false,
      showHeader: true,
      clicked: false,
      showLiveGiftOption: false,
    }
  }

  UNSAFE_componentWillMount() {
    let url = this.props.history.location.pathname
    if (url.includes('/games/')) this.setState({ showHeader: false })
    else if (url.includes('/loader')) this.setState({ showHeader: false })
    else if (url.includes('/config')) this.setState({ showLiveGiftOption: true })
    else if (url.includes('/remote')) this.setState({ showLiveGiftOption: true })
    else if (url.includes('/slot/')) this.setState({ showHeader: false })
    else if (url.includes('/slot/')) this.setState({ showHeader: false })
    else if (url.includes('/mirror/')) this.setState({ showHeader: false })
    else this.setState({ showHeader: true })
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (np.game.header && !np.game.indexPage && this.state.clicked && np.game.game && np.game.game.code) {
      const game_code = np.game.game.code
      gameWindow.location = '/games/' + game_code
      window.location = '/config/' + game_code
      this.setState({ clicked: false })
    }
    if (np.game.header && np.game.demoGame && this.props.game.gettingData && !np.game.gettingData) {
      const game_code = np.game.demoGame.code
      redirectWindow.location = '/games/' + game_code
    }
    let url = np.history.location.pathname
    if (url.includes('/games/')) this.setState({ showHeader: false })
    else if (url.includes('/remote')) this.setState({ showLiveGiftOption: true })
    else if (url.includes('/slot/')) this.setState({ showHeader: false })
    else if (url.includes('/trivia/')) this.setState({ showHeader: false })
    else if (url.includes('/mayhem_mates/')) this.setState({ showHeader: false })
    else if (url.includes('/mirror/')) this.setState({ showHeader: false })
    else if (url.includes('/series/')) this.setState({ showHeader: false })
    else this.setState({ showHeader: true })
  }

  handleClick() {
    if (!this.state.isOpen) document.addEventListener('click', this.handleOutsideClick, false)
    else document.removeEventListener('click', this.handleOutsideClick, false)

    this.setState(prevState => ({
      isOpen: !prevState.isOpen,
    }))
  }

  handleOutsideClick(e) {
    if (this.node && this.node.contains && this.node.contains(e.target)) return

    this.handleClick()
  }
  logoutUser = () => {
    localStorage.removeItem('indexImg')
    localStorage.removeItem('game_config_updated')
    localStorage.removeItem('game_updated')
    localStorage.removeItem('new_game_reset')
    localStorage.removeItem('answered')
    localStorage.removeItem('answer_updated')
    this.props.logoutUser().then(() => {
      this.props.history.push('/')
    })
  }

  startDemoGame = () => {
    redirectWindow = window.open(
      '/loader',
      '_blank',
      'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=9999, height=9999'
    )
    this.props.makeRequest('games/demo', { type: START_DEMO_GAME_FROM_HEADER })
  }

  createHostedGame() {
    this.setState({ clicked: true })
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
        background_music: true,
        automatic_song_advance: true,
        profile: 'Default',
        profile_id: 3,
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
    this.props.postRequest('/games', { type: CREATE_GAME_FROM_HEADER, values: values })
  }

  render() {
    const { showLiveGiftOption } = this.state
    return (
      <div style={{ display: this.state.showHeader ? '' : 'none' }}>
        <div
          className="nav-bar"
          ref={node => {
            this.node = node
          }}
        >
          <Link to="/">
            <div className="nav-bar-logo" />
          </Link>
          <div
            onClick={this.handleClick}
            className={this.state.isOpen ? 'nav-bar-hamburger nav-bar-hamburger__open' : 'nav-bar-hamburger'}
          >
            <div />
            <div />
            <div />
          </div>
        </div>
        <div className={this.state.isOpen ? 'nav-bar-content nav-bar-content__open' : 'nav-bar-content'}>
          <div className="nav-bar-content-links">
            {showLiveGiftOption && this.props.game.game && this.props.game.game.code && (
              <p>
                <Link style={{ color: 'yellow', marginTop: '-5px' }} to={'/gifting/' + this.props.game.game.code}>
                  <i className="fa fa-gift fa-2x" /> PLAYER REWARDS
                  <br /> & RAFFLES
                </Link>
                <Link to={'/answers/' + this.props.game.game.code}>
                  <i>SURE SHOT ANSWERS</i>
                </Link>
              </p>
            )}
            <Link to="/">Home</Link>
            <Link to="/index">Join Existing Game</Link>
            {this.props.auth && this.props.auth.accountLoggedIn && (
              <div>
                <a
                  onClick={() => {
                    this.createHostedGame()
                  }}
                >
                  Launch New Game
                </a>
                {this.props.auth.currentAccount &&
                  this.props.auth.currentAccount.role &&
                  this.props.auth.currentAccount.role == 'host' && <Link to="/series">Check League Scores</Link>}
                {this.props.auth.currentAccount &&
                  this.props.auth.currentAccount.role &&
                  this.props.auth.currentAccount.role == 'player' && <Link to="/my_score">My League Standing</Link>}
                <Link to="/career">My Mayhem Career</Link>
                <Link to="/accounts/setting">My Account</Link>
                {/* <a href="/buy_plan">My Subscription</a> */}
              </div>
            )}
            <a
              onClick={() => {
                this.startDemoGame()
              }}
            >
              solo play/demo
            </a>
            <Link to="/help">Help/Feedback</Link>
            {this.props.auth.currentAccount &&
              this.props.auth.currentAccount.role &&
              this.props.auth.currentAccount.role == 'host' && <Link to="/monitor">Mayhem Monitor</Link>}
            {this.props.auth && !this.props.auth.accountLoggedIn && <Link to="/login">Login</Link>}
            {this.props.auth && this.props.auth.accountLoggedIn && <a onClick={() => this.logoutUser()}>Logout</a>}
          </div>
          <div className="nav-bar-content-social">
            <a>
              <i className="fa fa-facebook" />
            </a>
            <a>
              <i className="fa fa-instagram" />
            </a>
            <a>
              <i className="fa fa-twitter" />
            </a>
            <a>
              <i className="fa fa-google" />
            </a>
          </div>
          <p className="nav-bar-content-copyright">&copy; Mayhem Trivia 2018 -All rights reserved.</p>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logoutUser: () => dispatch(logoutUser()),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
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
)(Example)
