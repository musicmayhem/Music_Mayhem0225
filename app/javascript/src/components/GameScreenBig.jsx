/* global document navigator setTimeout setInterval window*/
import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { setActiveSong, updateGameRequest } from '../actions/hostGameActions'
import ReactHtmlParser from 'react-html-parser'
import { postRequest } from '../actions/gameAction'

class GameScreenBig extends Component {
  constructor(props) {
    super(props)
    this.state = {
      time: props.game.time,
      points: props.game.points,
      diff: props.game.points / props.game.time,
      songPlayTime:
        props.game.songPlayTime == 0
          ? (parseInt(props.game.currentSong.length_in_seconds) - props.game.time) * 1000
          : (parseInt(props.game.songPlayTime) - props.game.time) * 1000,
      gameStarted: false,
      visibleSongName: this.makeTitleHash(props.game.songName),
      visibleArtistName: this.makeArtistHash(props.game.artist),
      visibleIndexed: [],
      titleUpdated: true,
    }
  }
  UNSAFE_componentWillMount() {
    window.clearInterval(window.timeInteval)
    window.clearInterval(window.updateInterval)
  }

  componentDidMount() {
    this._isMounted = true
    if (this.props.demo) document.getElementsByTagName('body')[0].style.padding = 0

    this.createAudioElement()
    document.getElementById('songPlayer').onplaying = () => {
      if (!this.props.mirror) {
        this.props.setActiveSong({
          song: { id: this.props.game.currentSong.id },
          game: { code: this.props.game.gameCode },
        })
      }
      this._playingStarted = true
      window.clearInterval(window.timeInteval)
      window.timeInteval = setInterval(() => {
        if (this.state.time >= 0) this.updateTiles()
      }, this.interval * 1000)
      window.clearInterval(window.updateInterval)
      window.updateInterval = setInterval(() => {
        if (this.state.time > 0 && this._isMounted) {
          this.setState({ time: this.state.time - 1 })
        } else if (this.state.time == 0 && this._playingStarted) {
          window.clearInterval(window.timeInteval)
          if (this._leaderboardRequest && this._isMounted) {
            this.showLeaderBoardRequest()
            this._leaderboardRequest = false
          }
        }
      }, 1000)
    }

    if (document.getElementById('playButton')) {
      document.getElementById('playButton').onclick = function() {
        this.startAudio()
      }.bind(this)
    }
  }

  componentWillUnmount() {
    if (this.props.demo) document.getElementsByTagName('body')[0].style.paddingTop = '5rem'

    window.clearInterval(window.timeInteval)
    window.clearInterval(window.updateInterval)
    this._isMounted = false
  }

  startAudio = () => {
    if(document.getElementById('songPlayer')) document.getElementById('songPlayer').play()
    let element = document.getElementById('playButton')
    if(element) element.parentNode.removeChild(element)
  }

  showLeaderBoardRequest() {
    if (!this.props.mirror) {
      this.props.postRequest('games/pusher_update', {
        values: { game: { code: this.props.game.gameCode, status: 'guessEnd' } },
      })
      setTimeout(() => {
        this.props.updateGameRequest({ game: { code: this.props.game.gameCode, state: 'Showing LeaderBoard' } })
        this._playingStarted = false
      }, this.state.songPlayTime)
    }
  }

  createAudioElement() {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      let x = document.createElement('AUDIO')
      x.autoplay = true
      x.id = 'songPlayer'
      x.preload = 'auto'
      x.volume = 0.8
      if (x.canPlayType('audio/mpeg')) x.setAttribute('src', this.props.game.songLink)
      else window.alert('Sorry the song cannot be played on your browser.')

      x.oncanplaythrough = function() {
        if (document.getElementById('playButton')) document.getElementById('playButton').style.display = 'block'
      }
      var btn = document.createElement('BUTTON')
      btn.innerText = 'Play'
      btn.id = 'playButton'
      btn.classList.add('play-btn-css')
      document.getElementById('playButtonDiv').appendChild(btn)
      document.getElementById('playButton').style.display = 'none'
      document.body.appendChild(x)
    } else {
      let x = document.createElement('AUDIO')
      x.id = 'songPlayer'
      x.preload = 'auto'
      x.autoplay = true
      x.volume = 0.8
      x.currentTime = this.props.game.songStartTime || 0
      if (x.canPlayType('audio/mpeg')) x.setAttribute('src', this.props.game.songLink)
      else window.alert('Sorry the song cannot be played on your browser.')

      x.setAttribute('controls', 'controls')
      document.body.appendChild(x)
    }
  }

  updateTiles() {
    if (this.state.titleUpdated) {
      if (this.artistSeq.length > 0) {
        let nextIndex = this.artistSeq.shift()
        let replacableIndex = this.artist.indexOf(this.artistHash[nextIndex])
        let temp = this.state.visibleArtistName
        temp[replacableIndex] = this.artistHash[nextIndex]
        this.setState({ visibleArtistName: temp, titleUpdated: false })
        this.artist[replacableIndex] = '-'
      } else if (this.titleSeq.length > 0) {
        this.setState({ titleUpdated: false })
        this.updateTiles()
      }
    } else {
      if (this.titleSeq.length > 0) {
        let nextIndex = this.titleSeq.shift()
        let replacableIndex = this.title.indexOf(this.titleHash[nextIndex])
        let temp = this.state.visibleSongName
        temp[replacableIndex] = this.titleHash[nextIndex]
        this.setState({ visibleSongName: temp, titleUpdated: true })
        this.title[replacableIndex] = '-'
      } else if (this.artistSeq.length > 0) {
        this.setState({ titleUpdated: true })
        this.updateTiles()
      }
    }
  }

  makeTitleHash(string) {
    let stringHashArray = []
    if (this.props.game) {
      let stringArray = string.split('')
      let counter = 1
      for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i].match(/^[a-z0-9]/i)) {
          this.titleHash[counter] = stringArray[i]
          counter++
          stringHashArray.push('#')
        } else if (stringArray[i] === ' ') {
          this.titleHash['s@' + i] = stringArray[i]
          stringHashArray.push('^')
        } else {
          this.titleHash['v@' + i] = stringArray[i]
          stringHashArray.push(stringArray[i])
        }
      }
      return stringHashArray
    }
  }

  makeArtistHash(string) {
    let stringHashArray = []
    if (this.props.game) {
      let stringArray = string.split('')
      let counter = 1
      for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i].match(/^[a-z0-9]/i)) {
          this.artistHash[counter] = stringArray[i]
          counter++
          stringHashArray.push('#')
        } else if (stringArray[i] === ' ') {
          this.artistHash['s@' + i] = stringArray[i]
          stringHashArray.push('^')
        } else {
          this.artistHash['v@' + i] = stringArray[i]
          stringHashArray.push(stringArray[i])
        }
      }
      return stringHashArray
    }
  }

  renderTiles(hashString) {
    let letters = hashString.map((char, key) => {
      if (char == '#') return `<div key=${key} class='letter-big hidden-letter-big'></div>`
      else if (char == '^') return `<div key=${key} class='letter-big space-letter-big'></div>`
      else return `<div key=${key} class='letter-big reveal-letter-big'>${char}</div>`
    })
    letters.push(`<div key=${hashString.length} class='letter-big space-letter-big'></div>`)
    let sentence = this.makeWords(letters)
    return <div>{ReactHtmlParser(sentence)}</div>
  }

  makeWords(strings) {
    var newString = []
    strings.forEach((s, i) => {
      var div = document.createElement('DIV')
      div.innerHTML = s
      if (i === -1) {
        newString.push('<div class="word-break">')
        newString.push(s)
      }
      if (div.firstChild.classList.contains('space-letter-big') && i !== strings.length - 1)
        newString.push('</div><div class="word-break">')
      else if (i === strings.length - 1) newString.push('</div>')
      else newString.push(s)
    })
    return newString.join('')
  }
  newLine(hashString) {
    let spacePosition = []
    for (let i = 0; i < hashString.length; i++) if (hashString[i] === '^') spacePosition.push(i)

    return spacePosition[3]
  }

  _isMounted = false
  _leaderboardRequest = true
  _playingStarted = false

  title = this.props.game.songName.split('')
  artist = this.props.game.artist.split('')
  titleHash = {}
  artistHash = {}
  interval = this.props.game.time / (this.props.game.seq.title.length + this.props.game.seq.artist.length)
  titleSeq = this.props.game.seq.title
  artistSeq = this.props.game.seq.artist
  timeInteval
  updateInterval

  render() {
    let pointTimer = Math.floor(this.state.time * this.state.diff)
    let song_count = this.props.game.songCount
    let { show_title_hint, show_artist_hint } = this.props.game
    return (
      <div style={{ color: '#fff' }}>
        {!this.props.demo && (
          <div className="yellow-header" style={{ marginBottom: 0 }}>
            <div className="timer">
              GOMAYHEM.COM <b>{this.props.game.gameCode}</b>
            </div>
            <div />
          </div>
        )}
        {true && (
          <div>
            <Row middle="xs" center="xs" style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Col xs={12}>
                {!this.props.demo && (
                  <h4
                    style={{
                      textTransform: 'uppercase',
                      fontWeight: '600',
                      marginBottom: '0',
                      marginTop: '0.3rem',
                      float: 'left',
                      verticalAlign: 'middle',
                    }}
                  >
                    {song_count}
                  </h4>
                )}
                <h2
                  className="mayhem-purple"
                  style={{
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    marginBottom: '0',
                    color: '#ffca27',
                    float: 'right',
                  }}
                >
                  <i className="fa fa-clock-o" style={{ verticalAlign: 'middle' }} /> {pointTimer} Points
                </h2>
              </Col>
            </Row>
            {show_title_hint && (
            <div style={{ padding: '2rem 2rem' }}>
              <div>
                <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>SONG TITLE</h2>
              </div>
              <Row center="xs">
                <Col xs={12} style={{ perspective: '800px' }}>
                  {this.renderTiles(this.state.visibleSongName)}
                </Col>
              </Row>
            </div>
           )}
           {show_artist_hint && (
            <div style={{ padding: '2rem 2rem' }}>
              <div>
                <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>ARTIST</h2>
              </div>
              <Row center="xs">
                <Col xs={12} style={{ perspective: '800px' }} className="tile-displayer">
                  {this.renderTiles(this.state.visibleArtistName)}
                </Col>
              </Row>
            </div>
           )}
           {!show_title_hint && !show_artist_hint && (
             <div style={{ padding: '4rem 4rem' }}>
               <div>
                 <h2 style={{ fontWeight: '900', textAlign: 'center', color: '#ffca27', fontSize: '10vmax' }}>BLIND ROUND</h2>
               </div>
             </div>
           )}
          </div>
        )}
        <div id="playButtonDiv" />
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setActiveSong: (params, type) => dispatch(setActiveSong(params, type)),
    updateGameRequest: (params, type) => dispatch(updateGameRequest(params, type)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
    }
  },
  mapDispatchToProps
)(GameScreenBig)
