import React from 'react'
import { Button, FormGroup, Label, FormFeedback, Container, Input, Row, Col } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { postRequest } from '../actions/gameAction'
import { SEND_HOST_ANSWER } from '../constants/gameConstants'
import Swal from 'sweetalert2'
import pusher from '../constants/pusher'
import Rewards from './Rewards'
import Tickets from '../components/PPTS/Tickets'
import Picks from '../components/PPTS/Picks'
import Spiffs from '../components/PPTS/Spiffs'
import { INTERJECTION } from '../components/helper'
import { REWARDS } from '../constants/accountConstants'
import GameOverScreen from './GameOverScreen'
import ChatModal from './ChatModal'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const validate = values => {
  const errors = { player: {} }
  const userFields = ['answer']
  userFields.forEach(field => {
    if (values['player'] && !values['player'][field] && values['player']['answer'] === '') {
      switch (field) {
        case 'answer':
          errors['player'][field] = 'guess value is required'
          break
      }
    }
  })
  return errors
}

const renderTextField = ({ input, button, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input
      id="guessField"
      onChange={input.onChange}
      value={input.value}
      autoCapitalize="off"
      autoComplete="off"
      spellCheck="false"
      autoCorrect="off"
      type={custom.type}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      autoFocus={custom.autoFocus}
    />
    <button
      type="button"
      className="fa fa-remove"
      style={{
        position: 'relative',
        top: '2rem',
        float: 'right',
        background: ' none',
        border: 'none',
        color: 'white',
      }}
      onClick={() => {
        document.getElementById('guessField').value = ''
      }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class UserGuess extends React.Component {
  state = {
    letPlayerGuess: true,
    reward: null,
    updateScore: false,
    gameOver: false,
    showChatModal: false,
  }

  componentDidMount() {
    this.loadSlideData(this.props.game)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.answerState && nextProps.answerState) {
      Swal.fire({
        position: 'center',
        type: 'success',
        title: 'Answer Submitted',
        showConfirmButton: false,
        timer: 1500,
      })
      localStorage['answer_updated'] = true
    }
  }
  PlayerProfile = player_name => {
    return (
      <div>
        <div style={{ marginTop: '5rem', padding: '10px' }}>
          <i style={{ fontWeight: 'bold', color: 'white', float: 'left', fontSize: '16px' }}>{player_name}</i>
          <br />
        </div>
      </div>
    )
  }

  ticketAlert(text) {
    toast.success(text, {
      position: 'top-right',
      autoClose: 30000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      draggablePercent: 40,
      className: 'toaster-css-1',
    })
  }

  _spiffValue = null

  guessValues = values => {
    if (this.props.player && this.props.player.player && this.props.player.player.id) {
      this.props.postRequest('player/send_host_answer', {
        type: SEND_HOST_ANSWER,
        values: {
          player: {
            answer: values['player']['answer'],
            id: this.props.player.player.id,
            question_number: this.props.game.game.question_number,
          },
        },
      })
    }
  }

  loadSlideData(gameData) {
    if (gameData.game) {
      let channel_name = 'games_' + gameData.game.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('slide_event', data => {
        console.log(data.type)
        switch (data.type) {
          case 'allowNextGuess':
            localStorage.removeItem('answer_updated')
            this.props.reset('answerForm')
            this.setState({ letPlayerGuess: true })
            break
          case 'increment_slide':
            break
          case 'decrement_slide':
            break
          case 'tickets_updated':
            if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
              this.props.postRequest('player/rewards', {
                type: REWARDS,
                values: { session_id: this.props.game.game.session_id },
              })
            }
            if (this.props.player &&
                this.props.player.player &&
                this.props.player.player.id == data.data) this.ticketAlert('🏆 +1 ticket awarded!')
            break
          case 'game_ended':
            this.setState({ gameOver: true })
            break
          case 'slot_machine':
          case 'respin_slot_machine':
            if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
              this.props.dispatch(
                postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
              )
            }
            this._spiffValue = data.spiff_value
            break
        }
      })
    }
  }

  render() {
    const player_name = this.props.player && this.props.player.player && this.props.player.player.name
    const { letPlayerGuess, reward, gameOver, showChatModal } = this.state
    const { handleSubmit } = this.props
    return (
      <div>
        {!gameOver && (
          <Container
            style={{
              height: '60vh',
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'column',
            }}
          >
            <div className="reward-css">
              <Rewards
                {...this.props}
                updateGuess={p => this.setState({ updateScore: p })}
                playerScreen
                pageState={p => this.setState({ reward: p })}
                getChatModal={() => this.setState({ showChatModal: true })}
              />
            </div>
            {reward == 'ticket' && <Tickets model {...this.props} pageState={p => this.setState({ reward: p })} spiffValue={this._spiffValue} />}
            {reward == 'pick' && <Picks model {...this.props} pageState={p => this.setState({ reward: p })} />}
            {reward == 'spiff' && <Spiffs model {...this.props} pageState={p => this.setState({ reward: p })} />}
            {showChatModal && <ChatModal code={this.props.match.params.game_code} closeModal={() => this.setState({ showChatModal: false })}/>}
            {!localStorage['answer_updated'] && letPlayerGuess && (
              <div className="custom-form" style={{ width: '85%' }}>
                <form onSubmit={handleSubmit(this.guessValues)}>
                  <Field
                    id="inp"
                    name="player.answer"
                    className="custom-form-field-w-label "
                    component={renderTextField}
                    label="ENTER ANSWER"
                    type="text"
                    autoFocus={true}
                  />
                  <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                    GUESS
                  </Button>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '1rem 0',
                      alignItems: 'center',
                    }}
                  />
                </form>
              </div>
            )}
            {localStorage['answer_updated'] && (
              <div
                style={{
                  height: '60vh',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Row>
                  <Col>
                    <h3 align="center" style={{ color: 'white' }}>
                      {INTERJECTION}
                    </h3>
                    <h5 align="center" style={{ color: 'white' }}>
                      Your Answer Has Been Accepted
                    </h5>{' '}
                    <p align="center" style={{ color: '#ddd' }}>
                      and shall soon face judgement
                    </p>
                  </Col>
                </Row>
              </div>
            )}
            {this.PlayerProfile(player_name)}
          </Container>
        )}
        {gameOver && <GameOverScreen />}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

const UserGuessForm = reduxForm({
  form: 'answerForm',
  validate,
})(UserGuess)

export default connect(
  state => {
    return {
      account: state.account,
      initialValues: { player: { answer: '', player_id: '' } },
    }
  },
  mapDispatchToProps
)(UserGuessForm)
