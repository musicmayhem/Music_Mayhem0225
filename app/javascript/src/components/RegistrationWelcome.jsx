/*global localStorage window */
import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { createPlayer, checkPlayerPresentInLastGame } from '../actions/playerActions'
import { connect } from 'react-redux'
import { getGameData } from '../actions/hostGameActions'
import { checkUserIsLogin } from '../actions/loginActions'

class RegistrationWelcome extends React.Component {
  state = {
    createPlayer: false,
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch(checkPlayerPresentInLastGame({ game_code: this.props.gameCode })).then(res => {
      if(res && res.present)
        this.props.allowJoin()
      if (res && localStorage['new_game_reset']) {
        if (this.props.game.game && this.props.game.game.jukebox_mode && this.props.game.game.jukebox_mode == false) {
          localStorage.removeItem('answer_updated')
          this.setState({ createPlayer: true })
          localStorage.removeItem('new_game_reset')
          this.props.dispatch(createPlayer({ game_code: this.props.gameCode }))
        }
      }
    })
    this.props.dispatch(getGameData({ game: { code: this.props.gameCode } }))
    this.props.dispatch(checkUserIsLogin())
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth && nextProps.auth.currentAccount && nextProps.game.game) {
      let game_code = this.props.gameCode
      if (nextProps.auth.currentAccount.role && nextProps.auth.currentAccount.role == 'host')
        window.location = '/config/' + game_code
    }
  }

  createGamePlayer() {
    if (!this.state.createPlayer) {
      this.setState({ createPlayer: true })
      this.props.dispatch(createPlayer({ game_code: this.props.gameCode }))
    }
  }

  render() {
    return (
      <Container>
        <Row style={{ color: '#fff', padding: '0 20px' }}>
          <Col xs={12}>
            <Row center="xs" bottom="xs" style={{ color: '#fff', fontSize: '0.9rem' }}>
              <h2 style={{ lineHeight: '1', fontWeight: 'bold' }}>
                WELCOME TO
                <br /> MUSIC MAYHEM!
              </h2>
            </Row>
          </Col>
          <br />
          <br />
          <br />
          <br />
          <Col xs={12}>
            <Row center="xs" bottom="xs" style={{ color: '#fff', fontSize: '0.9rem' }}>
              <h6 style={{ lineHeight: '1', fontWeight: 'bold' }}>YOUR USERNAME FOR THE GAME IS:</h6>
            </Row>
          </Col>
          <br />
          <br />
          <br />
          <br />
          <Col xs={12}>
            <Row center="xs" bottom="xs" style={{ color: '#ffca27', fontSize: '0.9rem' }}>
              <h4 className="font-light">{this.props.username}</h4>
            </Row>
          </Col>
          <br />
          <br />
          <br />
          <br />
          <Col xs={12}>
            <button
              className="join-link"
              onClick={() => {
                this.createGamePlayer()
                this.props.allowJoin()
              }}
            >
              <h4 id="join-button" style={{ fontWeight: 'bolder' }}>
                {' '}
                {this.state.createPlayer ? 'JOINING...' : 'JOIN '} {this.props.gameCode}
              </h4>
            </button>
          </Col>
        </Row>
        <br />
        <br />
      </Container>
    )
  }
}

function mapStateToProps(store) {
  return {
    player: store.player,
    game: store.game,
    auth: store.auth,
  }
}

export default connect(mapStateToProps)(RegistrationWelcome)
