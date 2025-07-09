/*global document localStorage setInterval setTimeout window*/
import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import Mobile from '../images/Mobile.svg'
import Pointer from '../images/Pointer.svg'
import Spell from '../images/icon_spelling.svg'
import { connect } from 'react-redux'
import { startingRoundServer } from '../actions/hostGameActions'
import { postRequest } from '../actions/gameAction'
import Advertisement from './Advertisement'
import MobileDetect from 'mobile-detect'
import Timer from './Timer'

class HostGameTimer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      gameData: null,
      time: null,
      gameCode: null,
      backgroundSongsUrl: [],
      showAdv: false,
      showHeader: false,
      startCountDownAudio: true,
      startSplash: true,
    }
  }

  UNSAFE_componentWillMount() {
    let gameData = this.props.game && this.props.game.game ? this.props.game.game : null
    let { showScoreboard, scoreboardDuration, scoreboardUrl } = this.props.scoreboard
    if(showScoreboard && scoreboardDuration && scoreboardUrl)
      var timer = Math.round(( scoreboardDuration + gameData.timer) * 60)
    else
      var timer = Math.round(gameData.timer * 60)
    this.setState({
      gameData: gameData,
      time: timer,
      gameCode: gameData.code,
      backgroundSongsUrl: this.props.game.songs_url,
    })
  }

  componentDidMount() {
    if (localStorage['game_updated']) {
      localStorage.removeItem('game_updated')
      document.getElementById('start-btn').click()
    }
    if (
      this.props.game &&
      this.props.game.game &&
      this.props.game.game.background_music == true &&
      this.props.game.game.timer != 0
    )
      this.createAudioElement()

    if (this.props.game.game && this.props.game.game.campaign_id) this.changeShowAdv()
  }

  componentDidUpdate() {
    if (this.state.time === 0) this.props.beginGame(true)
    if (this.state.time <= (this.props.splash.duration || 12) && this.state.startSplash) {
      this.setState({ startSplash: false })
      if (this.props.game.game.background_music) document.getElementById('backgroundSongPlayer').pause()
    }
    if(this.state.time <= 12 && this.props.roundStartingAudio.enable && this.state.startCountDownAudio) {
      this.setState({ startCountDownAudio: false })
      this.createCountdownAudio()
    }
  }

  componentWillUnmount() {
    if(!this.props.gameEnded)
      this.props.startingRoundServer({ round: this.props.game.rounds })
    if (
      this.props.game &&
      this.props.game.game &&
      this.props.game.game.background_music == true &&
      this.props.game.game.timer !== 0.0
    ) {
      this.backgroundSongFadeOut()
      setTimeout(() => {
        let element = document.getElementById('backgroundSongPlayer')
        if (element) element.parentNode.removeChild(element)
      }, 5000)
    }
  }

  backgroundSongFadeOut() {
    let player = document.getElementById('backgroundSongPlayer')
    if (player && player.volume > 0.2) {
      setTimeout(() => {
        player.volume = Math.abs(player.volume - 0.25)
        this.backgroundSongFadeOut()
      }, 1000)
    }
  }

  createCountdownAudio() {
    let x = document.createElement('AUDIO')
    x.id = 'countdownSongPlayer'
    x.preload = 'auto'
    x.volume = 0.8
    x.autoplay = true
    x.currentTime = 0
    x.src = 'https://s3.us-east-2.amazonaws.com/react-app-images/guitar-countdown.mp3'
    document.body.appendChild(x)
    x.play()
  }

  createAudioElement() {
    let songs_array = this.state.backgroundSongsUrl
    let x = document.createElement('AUDIO')
    let i = 0
    x.id = 'backgroundSongPlayer'
    x.preload = 'auto'
    x.volume = 0.3
    x.autoplay = true
    x.currentTime = 0
    if (x.canPlayType('audio/mpeg'))
      x.setAttribute('src', this.state.backgroundSongsUrl[this.state.backgroundSongsUrl.length - 1])

    document.body.appendChild(x)
    x.onended = function() {
      x.src = songs_array[i]
      x.play()
      i = i + 1
      if (i == songs_array.length) i = 0
    }
  }

  renderTimer() {
    return (
      <span>
        {this.state.time % 60 < 10 ? '0' + parseInt(this.state.time / 60) + 'm' : parseInt(this.state.time / 60) + 'm'}{' '}
        {this.state.time % 60 < 10 ? '0' + parseInt(this.state.time % 60) + 's' : parseInt(this.state.time % 60) + 's'}
      </span>
    )
  }

  activateTimer() {
    this.setState({ showHeader: true })
    document.getElementById('start-btn').style.display = 'none'
    if (this.state.time == 0) {
      this.setState({ time: 0 })
    } else if (this.state.time != 0) {
      setInterval(() => {
        if (this.state.time >= 1) this.setState({ time: this.state.time - 1 })
      }, 1000)
    }
  }

  changeShowAdv = () => {
    if (this.state.time != 0) {
      var timer = this.props.game.advertise_time ? this.props.game.advertise_time * 1000 : 10000
      this.setState({ showAdv: !this.state.showAdv })
      setTimeout(this.changeShowAdv, timer)
    }
  }

  render() {
    const md = new MobileDetect(window.navigator.userAgent)
    const isMobile = md.mobile()
    const { showAdv, showHeader } = this.state
    const { splash } = this.props
    const { showScoreboard, scoreboardUrl, scoreboardDuration } = this.props.scoreboard
    const game_code_display = this.props.game && this.props.game.game && this.props.game.game.game_code_display
    return (
      <div>
        <div className="yellow-header">
          <Row>
            <div style={{ textAlign: 'left', justifyContent: 'left' }} className="timer">
              GOMAYHEM.COM
              {game_code_display && <b>{' code: '+this.state.gameCode}</b>}
            </div>
            {showHeader && (
              <div
                style={{ textAlign: 'right', justifyContent: 'right', paddingRight: '3rem', width: '100%', position: 'absolute' }}
                className="timer"
              >
                {isMobile ? <br /> : ''}
                <i className="fa fa-clock-o" style={{ marginRight: 3 }} />
                STARTS IN: {this.renderTimer()}
                {splash && !showScoreboard && !splash.enable && this.state.time <= 14 && (
                  <Timer time={0.1833333} data={'Game will start in'} position="no-position" />
                )}
                {splash && !splash.enable && showScoreboard && scoreboardDuration && this.state.time > scoreboardDuration*60 && this.state.time <= (scoreboardDuration*60 + 14) && (
                  <Timer time={0.1833333} data={'Game will start in'} position="no-position" />
                )}
                {splash && !showScoreboard && splash.enable && this.state.time <= (splash.duration || 14) && (
                  <Advertisement
                    startPage={true}
                    assetsUrl={[[splash.url, splash.url, splash.url], [splash.url, splash.url, splash.url]]}
                  />
                )}
                {splash && showScoreboard && splash.enable && scoreboardDuration && this.state.time <= (scoreboardDuration*60 +(splash.duration || 14)) && (
                  <Advertisement
                    startPage={true}
                    assetsUrl={[[splash.url, splash.url, splash.url], [splash.url, splash.url, splash.url]]}
                  />
                )}
                {showScoreboard && scoreboardUrl && scoreboardDuration && this.state.time <= scoreboardDuration*60  && (
                  <Advertisement
                    scoreboard
                    startPage={true}
                    assetsUrl={[[scoreboardUrl, scoreboardUrl, scoreboardUrl], [scoreboardUrl, scoreboardUrl, scoreboardUrl]]}
                  />
                )}
              </div>
            )}
          </Row>
          <div />
        </div>
        {!showAdv && (
          <Container>
            <Row center="xs" style={{ color: '#fff' }}>
              <Col xs={12} md={12} style={{ margin: '2rem 0' }}>
                <h2 style={{ lineHeight: '1', fontWeight: 'bold', fontSize: '7vh', color: '#ffca27' }}>
                  PLAY MUSIC MAYHEM NOW!
                </h2>
                <h2 style={{ lineHeight: '1', fontWeight: 'bold', fontSize: '5vh', color: '#fff', marginTop: '1rem' }}>
                  GoMayhem.com game code:
                </h2>
                <br />
                <h2
                  style={{
                    borderBottom: '1px solid #210345',
                    lineHeight: '1',
                    fontWeight: 'bold',
                    fontSize: '10vh',
                    color: '#ffca27',
                    paddingBottom: '2rem',
                  }}
                >
                  {game_code_display ? this.state.gameCode : '***'}
                </h2>
              </Col>
              <Col xs={12} md={12} style={{ margin: '2rem 0' }}>
                <Row center="xs" top="xs" style={{ color: '#ffca27', fontSize: '0.9rem' }}>
                  <Col xs={4}>
                    <img src={Mobile} width="65px" style={{ margin: '0.5rem 0' }} />
                    <p style={{ fontSize: '1.8vw' }}>Grab A Phone</p>
                  </Col>
                  <Col xs={4}>
                    <div className="code-badge">
                      {game_code_display ? this.state.gameCode : '***'}
                      <img src={Pointer} />
                    </div>
                    <p style={{ fontSize: '1.8vw' }}>Enter Join Code </p>
                  </Col>
                  <Col xs={4}>
                    <img src={Spell} width="60px" style={{ margin: '0.5rem 0' }} />
                    <p style={{ fontSize: '1.8vw' }}>Listen, Guess & Win!</p>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        )}
        {showAdv && this.props.game.adv_images && (
          <Advertisement
            startPage={true}
            assetsUrl={this.props.game.adv_images}
            advDuration={this.props.game.advertise_time}
          />
        )}
        <Row center="xs">
          <Col>
            <button
              id="start-btn"
              style={{ position: 'fixed', left: '50%', bottom: '1rem', transform: 'translateX(-50%)' }}
              className="mayhem-link-light"
              onClick={() => {
                this.activateTimer()
              }}
            >
              Start Game
            </button>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    startingRoundServer: params => dispatch(startingRoundServer(params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

export default connect(
  state => {
    return {
      game: state.game,
    }
  },
  mapDispatchToProps
)(HostGameTimer)
