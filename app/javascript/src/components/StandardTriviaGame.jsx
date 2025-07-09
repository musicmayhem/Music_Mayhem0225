import React from 'react'
import pusher from '../constants/pusher'
import { connect } from 'react-redux'
import * as actions from '../actions/hostGameActions'
import GameOverScreen from './GameOverScreen'
import SlotMachine from './slotMachine/SlotMachine'
import { Row } from 'react-flexbox-grid'
import Advertisement from './Advertisement'
import { changeSongVolume } from '../components/helper'

class StandardTriviaGame extends React.Component {
  state = {
    slideUrl: null,
    gameOver: false,
    slotMachine: false,
    lastSlideNumber: 1,
    showPpt: false,
  }

  _spiffValue = null

  UNSAFE_componentWillMount() {
    this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { game } = nextProps
    if (!this.props.game.game && game.game) {
      this.setState({ slideUrl: game.game.trivia_url })
      this.loadData(game)
    }
    if(!this.props.game.songs_url && game.game && game.game.background_music == true && game.songs_url)
      this.createAudioElement(game.songs_url)
  }

  loadData(gameData) {
    if (gameData.game) {
      let channel_name = 'games_' + gameData.game.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('slide_event', data => {
        console.log('SE', data.type)
        switch (data.type) {
          case 'increment_slide':
            this.incrementSlide()
            break
          case 'decrement_slide':
            this.decrementSlide()
            break
          case 'game_ended':
            this.setState({ gameOver: true, slotMachine: false })
            break
          case 'slot_machine':
            this._spiffValue = data.spiff_value
            this.setState({ slotMachine: true, showPpt: false})
            break
          case 'close_slot_machine':
            this.setState({ slotMachine: false, showPpt: false })
            this.afterTicketSpin()
            break
          case 'respin_slot_machine':
            this._spiffValue = data.spiff_value
            this.setState({ slotMachine: false, showPpt: false})
            this.setState({ slotMachine: true, showPpt: false })
            break
          case 'start_new_game':
            window.location = data.data
            break
          case 'standard_trivia_ended':
            window.location = '/games/' + this.props.match.params.game_code
            break
          case 'show_ppt':
            this.setState({ showPpt: true, slotMachine: false })
            break
          case 'volume_bcg_up':
            changeSongVolume('volume_bcg_up')
            break
          case 'volume_bcg_down':
            changeSongVolume('volume_bcg_down')
            break
        }
      })
    }
  }
  incrementSlide = () => {
    var iframe = document.getElementById('myFrame')
    if (iframe) {
      var url = iframe.src
      var slideNumber = url.split('&slide=')[1]
      this.setState({ lastSlideNumber: slideNumber })
      url = url.replace('slide=' + slideNumber, 'slide=' + (parseInt(slideNumber) + 1))
      iframe.src = url
    }
  }

  afterTicketSpin = () => {
    const previous_slide_number = parseInt(this.state.lastSlideNumber) + 1
    var iframe = document.getElementById('myFrame')
    if (iframe) {
      var url = iframe.src
      var slideNumber = url.split('&slide=')[1]
      url = url.replace('slide=' + slideNumber, 'slide=' + previous_slide_number)
      iframe.src = url
    }
  }

  decrementSlide = () => {
    var iframe = document.getElementById('myFrame')
    if (iframe) {
      var url = iframe.src
      var slideNumber = url.split('&slide=')[1]
      var nextSlideNumber = parseInt(url.split('&slide=')[1]) - 1
      if (nextSlideNumber > 0) {
        url = url.replace('&slide=' + slideNumber, '&slide=' + nextSlideNumber.toString())
        iframe.src = url
      }
    }
  }

createAudioElement(songs) {
    let songs_array = songs
    let x = document.createElement('AUDIO')
    let i = 0
    x.id = 'backgroundSongPlayer'
    x.preload = 'auto'
    x.volume = 0.1
    x.autoplay = true
    x.currentTime = 0
    if (x.canPlayType('audio/mpeg'))
      x.setAttribute('src', songs_array[songs_array.length - 1])

    document.body.appendChild(x)
    x.onended = function() {
      x.src = songs_array[i]
      x.play()
      i = i + 1
      if (i == songs_array.length) i = 0
    }
  }

  render() {
    const { slideUrl, gameOver, slotMachine, showPpt } = this.state
    const game_code_display = this.props.game && this.props.game.game && this.props.game.game.game_code_display
    return (
      <div>
        {!slotMachine && !showPpt && (
          <div>
            {!gameOver && (
              <div>
              <div className="yellow-header">
                <Row>
                <div style={{ textAlign: 'left', justifyContent: 'left' }}>
                  GOMAYHEM.COM
                  {game_code_display && <b>{' code: '+this.props.match.params.game_code}</b>}
                </div>
               </Row>
              </div>
              <div className="iframeWrapper2">
                <div className="full-screen-image" style={{ width: '100vw', height: '100vh' }}>
                  <iframe
                    id="myFrame"
                    src={slideUrl}
                    allowFullScreen
                    className="advertise-img"
                    frameBorder="0"
                    height="839"
                    mozallowfullscreen="true"
                    webkitallowfullscreen="true"
                    width="1440"
                    scrolling="no"
                  />
                </div>
              </div>
             </div>
            )}
            {gameOver && <GameOverScreen sharedScreen />}
          </div>
        )}
        {slotMachine && <SlotMachine {...this.props} spiffValue={this._spiffValue} />}
        {showPpt && (
          <Advertisement
            flashppt
            assetsUrl={[
              [],
              [
                'https://docs.google.com/presentation/d/e/2PACX-1vQeBFEFtM6RXSCR1qiT7HvxGwmD5DTpmg1QUH4tVTgBJgTAvDSewK9NJC-mmDIiHe9fJPWS1Ah12hUN/embed?start=true&loop=false&delayms=3000&slide=id.p',
              ],
            ]}
            gameCode={this.props.match.params.game_code}
            game_code_display={game_code_display}
          />
        )}
      </div>
    )
  }
}
function mapStateToProps(store) {
  return {
    game: store.game,
  }
}

export default connect(mapStateToProps)(StandardTriviaGame)
