import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { postRequest } from '../../actions/gameAction'
import { GIFTING_DATA } from '../../constants/gameConstants'
import { SENDING_REWARDS } from '../../constants/accountConstants'
import pusher from '../../constants/pusher'
import { FormGroup, Label, Input, FormFeedback, Container } from 'reactstrap'
import { Field, reduxForm, change, reset } from 'redux-form'
import Swal from 'sweetalert2'
import { checkUserIsLogin } from '../../actions/loginActions'
import { HelpSection } from '../Utils/HelpSection'
import ChatModal from '.././ChatModal'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const validate = values => {
  const errors = { gift: {} }
  if (values['gift'] && !values['gift']['value']) errors['gift']['value'] = 'This field is required'

  return errors
}

const renderSelectField = ({ input, label, meta: { error }, ...custom }) => (
  <FormGroup className="custom-form-field-w-label-white">
    <Label>{label}</Label>
    <Input {...input} {...custom} type="select">
      {custom.options}
    </Input>
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="custom-form-field-w-label-white">
    <Label>{label}</Label>
    <Input
      {...input}
      {...custom}
      onChange={input.onChange}
      value={input.value}
      type={custom.type}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      style={{ color: '#ffca27' }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const renderCheckBoxField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="game-config-checkbox-css" style={{ color: 'grey' }}>
    <Label style={{ margin: '0.4rem 1rem', fontSize: 'large' }}>{label}</Label>
    <Input {...input} {...custom} type="checkbox" style={{ color: '#ffca27' }} />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const GIFT_OPTIONS = ['Picks', 'Points', 'Tickets', 'Spiffs']
const giftNames = GIFT_OPTIONS.map((state, index) => {
  return <option key={index}> {state} </option>
})

class LiveGifting extends React.Component {
  state = {
    options: 'Tickets',
    showSpiffField: false,
    showSpiffValue: false,
    showSpiffCheckBox: true,
    showProceed: false,
    showChatModal: false,
  }

  _runOnce = true

  UNSAFE_componentWillMount() {
    this.props.dispatch(checkUserIsLogin())
    this.props.dispatch(
      postRequest('games/gifting_component', {
        type: GIFTING_DATA,
        values: { game: { code: this.props.match.params.game_code } },
      })
    )
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (np.game && np.game.game && this._runOnce) {
      this.runOnce = false
      this.loadGameData(np.game)
    }
    if (np.account.giftStatus && this._notifyOnce) {
      this._notifyOnce = false
      this.setState({ showSpiffField: false })
      Swal({
        position: 'center',
        type: 'success',
        title: np.account.giftStatus,
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  loadGameData(gameData) {
    if (gameData.game) {
      let channel_name = 'games_' + gameData.game.id
      pusher.unsubscribe(channel_name)
      const channel = pusher.subscribe(channel_name)
      channel.bind('game_event', data => {
        console.log(data.type)
        switch (data.type) {
         case 'new_message':
            if (data.data.message_to == 'Game Host')
              this.noticeAlert(' 💬 '+data.data.message_from+' : '+data.data.message+' ')
            break
        }
      })
    }
  }

  noticeAlert(text) {
    toast.success(text, {
      position: 'top-right',
      autoClose: 60000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      draggablePercent: 40,
      className: 'toaster-css-2',
    })
  }

  getHelp() {
    HelpSection()
  }

  pusherRequest(event) {
    this.props.dispatch(
      postRequest('games/pusher_update', {
        values: { game: { code: this.props.match.params.game_code, status: event, spiff_value: this._spiffValue } },
      })
    )
  }

  giftValues = values => {
    this.props.dispatch(
      postRequest('player/send_rewards', {
        type: SENDING_REWARDS,
        values: { game: { code: this.props.match.params.game_code }, ...values },
      })
    )
    this.props.dispatch(reset('giftForm'))
    this.setState({ options: 'Tickets' })
    this._notifyOnce = true
  }

  pptsOptions = val => {
    this.props.dispatch(reset('giftForm'))
    this.props.dispatch(change('giftForm', 'gift.value', ''))
    this.setState({ options: val })
  }

  setSpiffValue = data => {
    if (data.spiff_value) {
      this._spiffValue = data.spiff_value
      var element = document.getElementById('spiffCheckBox')
      if (element) {
        element.checked = false
        element.value = false
      }
      this.setState({ showSpiffField: false, showSpiffValue: true, showSpiffCheckBox: false })
      Swal({
        type: 'success',
        title: 'Prize value set Successfully',
        showConfirmButton: false,
        timer: 1500,
      })
    } else {
      Swal({
        type: 'warning',
        title: 'Prize value is required',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  _notifyOnce = true
  _spiffValue = null

  render() {
    const { options, showSpiffField, showSpiffValue, showSpiffCheckBox, showChatModal } = this.state
    const { handleSubmit } = this.props
    const { players, series } = this.props.game
    return (
      <Container>
        <Row>
          <Col xs={12} md={8} mdOffset={2} style={{ background: '#fff', padding: '1rem' }}>
            <Row center="xs">
              <Col xs>
                <a
                  onClick={() => {
                    this.getHelp()
                  }}
                >
                  <i className="fa fa-life-ring" /> Host Help
                </a>
              </Col>
              <Col xs>
                <a
                  onClick={() => {
                    this.setState({ showChatModal: true })
                  }}
                >
                  <i className="fa fa-comments-o" aria-hidden="true"></i> Game Chat
                </a>
              </Col>
            </Row>
            {showChatModal && <ChatModal code={this.props.match.params.game_code} closeModal={() => this.setState({ showChatModal: false })}/>}
            <Row>
              <Col xs>
                <a
                  onClick={() => window.history.back()}
                  style={{ color: '#ffca27', textDecoration: 'none', fontWeight: 'bold', lineHeight: '3.5' }}
                >
                  <i className="fa fa-arrow-left" /> BACK TO THE GAME
                </a>
              </Col>
            </Row>
            <h5 style={{ color: '#241b44', fontWeight: 'bolder' }}>
              {series && series.name ? series.name : 'NO SERIES'}
            </h5>
            <p style={{ margin: '0.3rem', fontSize: '0.8rem', color: 'grey' }}>
              Active Session: {series && series.active ? series.active : 'NO SESSION'}
            </p>
            <h3 className="bold" style={{ marginTop: '0.8rem' }}>
              Gifts
            </h3>
            <p style={{ color: 'grey', marginTop: '0.5rem', fontSize: '0.8rem' }}>
              Select the type of gift,amount,and the recipients below
            </p>
            <form onSubmit={handleSubmit(this.giftValues)}>
              <Field
                name="gift.type"
                component={renderSelectField}
                label="SELECT GIFT TYPE"
                options={giftNames}
                onChange={p => this.pptsOptions(p.target.value)}
              />
              {options == 'Tickets' && (
                <Field
                  name="gift.value"
                  component={renderTextField}
                  type="number"
                  min="1"
                  max="99"
                  maxLength="4"
                  label="Ticket Count"
                  autoFocus
                />
              )}
              {options == 'Spiffs' && (
                <Field name="gift.value" component={renderTextField} label="Spiff Type" autoFocus />
              )}
              {options == 'Points' && <Field name="gift.value" component={renderTextField} label="AMOUNT" autoFocus />}
              {players && players.length != 0 && (
                <Field name="gift.all" component={renderCheckBoxField} label="SELECT ALL" />
              )}
              {players &&
                players.length != 0 &&
                players.map(x => (
                  <Field key={x.id} name={`gift.${x.id}`} component={renderCheckBoxField} label={x.name} />
                ))}
              <button className="mayhem-btn-blue btn-full-width" type="submit" style={{ marginTop: '0.5rem' }}>
                SEND GIFT
              </button>

            </form>
            <hr/>
            <h3 className="bold" style={{ marginTop: '0.8rem' }}>
              Raffles
            </h3>
              <p style={{ color: 'grey', marginTop: '0.5rem', fontSize: '0.8rem' }}>
              Set an award for the drawing and spin the wheel!
              </p>
              <button
              className="mayhem-btn-blue btn-full-width"
              style={{ backgroundColor: '#ed4e6b', marginTop: '3rem' }}
              onClick={() => {
                this.pusherRequest('showPpt')
                this.setState({ showProceed: true })
              }}
            >
              <i
                style={{ fontSize: '1.8rem', position: 'relative', right: '10px', top: '3px' }}
                className="fa fa-ticket"
                aria-hidden="true"
              />
              DO A DRAWING
            </button>
            {showSpiffCheckBox && (
              <Field
                id="spiffCheckBox"
                name="spiffCheckBox"
                component={renderCheckBoxField}
                label="SET DRAWING PRIZE"
                onChange={() => {
                  this.setState({ showSpiffField: !this.state.showSpiffField, showSpiffValue: false })
                }}
              />
            )}
            {showSpiffField && (
              <form onSubmit={handleSubmit(this.setSpiffValue)}>
                <Row>
                  <Col xs={6} style={{ background: '#fff', padding: '1rem' }}>
                    <Field
                      style={{ width: '50%' }}
                      name="spiff_value"
                      component={renderTextField}
                      label="ENTER PRIZE VALUE"
                      autoFocus
                    />
                  </Col>
                  <Col xs={6} style={{ background: '#fff', padding: '1rem' }}>
                    <button className="mayhem-btn-blue btn-full-width" type="submit" style={{ height: '80%' }}>
                      SET PRIZE VALUE
                    </button>
                  </Col>
                </Row>
              </form>
            )}
            {showSpiffValue && (
              <div>
                Prize Value : {this._spiffValue}
                <button
                  type="button"
                  className="fa fa-remove"
                  style={{
                    top: '-4rem',
                    background: ' none',
                    border: 'none',
                    color: 'black',
                  }}
                  onClick={() => {
                    this._spiffValue = null
                    this.setState({ showSpiffCheckBox: true, showSpiffValue: false })
                  }}
                />
              </div>
            )}
            {this.state.showProceed && (
              <button
                className="mayhem-btn-blue btn-full-width"
                style={{ backgroundColor: '#ed4e6b', marginTop: '1rem' }}
                onClick={() => {
                  this.pusherRequest('openSlotMachine')
                  this.setState({ showProceed: false })
                }}
              >
                SPIN NOW!
              </button>
            )}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                style={{ marginLeft: '0' }}
                className="close-ticket-btn"
                onClick={() => {
                  this.pusherRequest('markTicketAsRedeemed')
                  this.setState({ showProceed: false })
                }}
              >
                <i
                  style={{ fontSize: '1.6rem', position: 'relative', right: '5px', top: '3px' }}
                  className="fa fa-check"
                  aria-hidden="true"
                />
                TICKET REDEEMED
              </button>
              <button
                style={{ marginLeft: '0' }}
                className="close-ticket-btn"
                onClick={() => this.pusherRequest('reSpinSlotMachine')}
              >
                <i
                  style={{ fontSize: '1.6rem', position: 'relative', right: '5px', top: '2px' }}
                  className="fa fa-refresh"
                  aria-hidden="true"
                />
                RESPIN
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }
}

const GiftForm = reduxForm({
  form: 'giftForm',
  validate,
  enableReinitialize: true,
})(LiveGifting)

function mapStateToProps(store) {
  return {
    auth: store.auth,
    game: store.game,
    account: store.account,
    initialValues: { gift: { type: 'Tickets', value: '1' } },
  }
}

export default connect(mapStateToProps)(GiftForm)
