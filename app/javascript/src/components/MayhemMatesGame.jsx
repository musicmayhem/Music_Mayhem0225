import React from 'react'
import pusher from '../constants/pusher'
import { connect } from 'react-redux'
import * as actions from '../actions/hostGameActions'
import GameOverScreen from './GameOverScreen'
import SlotMachine from './slotMachine/SlotMachine'
import { Row, Col } from 'react-flexbox-grid'
import Advertisement from './Advertisement'
import { Container, Button} from 'reactstrap'

class MayhemMatesGame extends React.Component {
  state = {
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
      this.loadData(game)
    }
    if(!this.props.game.songs_url && game.game && game.game.background_music == true && game.songs_url)
      this.createAudioElement(game.songs_url)
  }

  loadData(gameData) {
    if (gameData.game) {
      let channel_name = 'games_' + gameData.game.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('mayhem_mates_event', data => {
        console.log('PE', data.type)
        switch (data.type) {
          case 'game_ended':
            this.setState({ gameOver: true, slotMachine: false })
            break
          case 'slot_machine':
            this._spiffValue = data.spiff_value
            this.setState({ slotMachine: true, showPpt: false})
            break
          case 'close_slot_machine':
            this.setState({ slotMachine: false, showPpt: false })
            break
          case 'respin_slot_machine':
            this._spiffValue = data.spiff_value
            this.setState({ slotMachine: false, showPpt: false})
            this.setState({ slotMachine: true, showPpt: false })
            break
          case 'start_new_game':
            window.location = data.data
            break
          case 'mayhem_mates_ended':
            window.location = '/games/' + this.props.match.params.game_code
            break
          case 'show_ppt':
            this.setState({ showPpt: true, slotMachine: false })
            break
        }
      })
    }
  }

  createAudioElement(songs) {
    let songs_array = songs
    let x = document.createElement('AUDIO')
    let i = 0
    x.id = 'backgroundSongPlayer'
    x.preload = 'auto'
    x.volume = 0.3
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
    const { gameOver, slotMachine, showPpt } = this.state
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
              <Container>
                <Row style={{ color: '#fff', padding: '0 20px' }}>
                  <Col xs={12}>
                    <Row center="xs" bottom="xs" style={{ color: '#fff', fontSize: '2.5vamx' }}>
                      <h1 style={{ lineHeight: '1', fontWeight: 'bold', marginTop: '20vmax' }}>
                        MAYHEM MATCH
                      </h1>
                      <h2>
                        <br /> Find the other player(s) with the same MATCH word to win 5 tickets!
                      </h2>
                    </Row>
                  </Col>
                </Row>
              </Container>
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

export default connect(mapStateToProps)(MayhemMatesGame)
