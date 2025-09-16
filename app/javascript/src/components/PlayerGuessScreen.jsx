import React from 'react'
import { Button, FormGroup, Label, FormFeedback, Container, Row, Col, Input } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm, change } from 'redux-form'
import { playerGuess } from '../actions/guessCheckerActions'
import Swal from 'sweetalert2'
import { postRequest } from '../actions/gameAction'
import { SEND_HOST_ANSWER } from '../constants/gameConstants'
import { PLAYER_TOTAL_SCORE } from '../constants/playerConstants'
import Rewards from './Rewards'
import Tickets from '../components/PPTS/Tickets'
import Picks from '../components/PPTS/Picks'
import Spiffs from '../components/PPTS/Spiffs'
import { INTERJECTION } from '../components/helper'
import 'react-toastify/dist/ReactToastify.css'
import { resetState } from '../actions/guessCheckerActions'
import AdSense from 'react-adsense';

const validate = values => {
  const errors = { guess: {} }
  const userFields = ['title']

  userFields.forEach(field => {
    if (values['guess'] && !values['guess'][field]) {
      switch (field) {
        case 'title':
          errors['guess'][field] = 'guess value is required'
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
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class UserGuess extends React.Component {
  state = {
    redeemed: false,
    reward: null,
    artistScoreShown: false,
    titleScoreShown: false,
    yearScoreShown: false,
    updateScore: false,
    guessedValue: '',
    typingStartTime: null,
  }

  UNSAFE_componentWillMount() {
    this._animateOnce = true
    this.props.dispatch(resetState())
    this.props.postRequest('player/total_score', {
      type: PLAYER_TOTAL_SCORE,
      values: { player: { id: this.props.player } },
    })
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (!this.props.guessTimerEnd && np.guessTimerEnd) this._timerEnd = true

    if (np.account.lastPickRedeemed && np.account.lastPickRedeemed == 'Sneak Peek' && this._redeemOnce) {
      this._redeemOnce = false
      this.setState({ redeemed: true })
    }
    if (np.account.lastPickRedeemed && np.account.lastPickRedeemed == 'Free Ride' && this._redeemOnce) {
      this._redeemOnce = false
      this.props.playerGuess({ guess: { title: 'default', player_id: np.player } })
    }
    if (document.getElementById('guessInput') && this._animateOnce) {
      this._animateOnce = false
      document
        .getElementById('guessInput')
        .setAttribute(
          'style',
          'animation: beat 0.5s; border: 2px solid #ffca27; box-shadow: 2px 5px 9px #ffca27; border-radius : 10px;'
        )
    }
  }

  componentWillUnmount() {
    this.props.setRoundTotalScore(this.props.guess.total_score)
  }

  PlayerProfile = (player_name, song_score, total_score, song_count) => {
    return (
      <div>
        <div style={{ marginTop: '5rem', padding: '10px' }}>
          <i style={{ fontWeight: 'bold', color: 'white', float: 'left', fontSize: '16px' }}>{player_name}</i>
          <br />
          <h3 style={{ fontWeight: '600', color: '#ffc107', float: 'left', fontSize: '14px' }}>
            SONG SCORE: <span className="figure">{song_score || 0}</span>
          </h3>
          <br />
          <h3 style={{ fontWeight: '600', color: '#ffc107', float: 'left', fontSize: '14px', position: 'absolute' }}>
            ROUND SCORE: <span className="figure">{total_score || 0}</span>
          </h3>
          <br />
          <i style={{ fontWeight: 'bold', color: '#ffc107', float: 'left', fontSize: '16px' }}>{song_count}</i>
          <br />
          {/* <AdSense.Google
            client='ca-pub-3018362527059954'
            slot='7806394673' //Please place original slot id
            style={{ width: 500, height: 300, float: 'left' }}
            format=''
          /> */}
        </div>
        {this.props && this.props.game && this.props.game.open_session && (
          <div className="reward-css">
            <Rewards
              {...this.props}
              updateGuess={p => this.setState({ updateScore: p })}
              playerScreen
              pageState={p => this.setState({ reward: p })}
              getChatModal={() => this.props.getChatModal()}
            />
          </div>
        )}
      </div>
    )
  }

  guessValues = values => {
    values['guess']['player_id'] = this.props.player
    values['guess']['typing_start_time'] = this.state.typingStartTime
    values['guess']['player_status'] = this.props.player_status
    this.props.playerGuess(values, data => {
      if (
        data.guess &&
        data.guess.artist_score &&
        data.guess.artist_score > 0 &&
        !this.state.artistScoreShown
      ) {
        this.setState({ artistScoreShown: true })
        this.setState({ guessedValue: '', typingStartTime: null })
        Swal.fire({
          title:
            '<span style="color:#ffca36;font-size: 24.5px;font-weight: 600;position: relative;right: 3.5rem;top: -1rem;">POW!<span>',
          html:
            '<span style="color:white;font-size: 15px;position:relative;top: -1rem;font-weight: 600;">Artist score: <span>' +
            '<span style="color:#ffca36;font-size: 22px"><span>' +
            `${data.guess.artist_score}`,
          width: 300,
          padding: '2em',
          background: '#321b47',
          backdrop: 'rgba(0,0,123,0.4)',
          showCloseButton: true,
          showConfirmButton: false,
          timer: 1500,
        })
        this.props.reset('guessForm')
      } else if (
        data.guess &&
        data.guess.title_score &&
        data.guess.title_score > 0 &&
        !this.state.titleScoreShown
      ) {
        this.setState({ titleScoreShown: true })
        this.setState({ guessedValue: '', typingStartTime: null })
        Swal.fire({
          title:
            '<span style="color:#ffca36;font-size: 24.5px;font-weight: 600;position: relative;right: 3.5rem;top: -1rem;">WOOT!<span>',
          html:
            '<span style="color:white;font-size: 15px;position:relative;top: -1rem;font-weight: 600;">Title score: <span>' +
            '<span style="color:#ffca36;font-size: 22px"><span>' +
            `${data.guess.title_score}`,
          width: 300,
          padding: '2em',
          background: '#321b47',
          backdrop: 'rgba(0,0,123,0.4)',
          showCloseButton: true,
          showConfirmButton: false,
          timer: 1500,
        })
        this.props.reset('guessForm')
      } else if (
        data.guess &&
        data.guess.year_score &&
        data.guess.year_score > 0 &&
        !this.state.yearScoreShown
      ) {
        this.setState({ yearScoreShown: true })
        this.setState({ guessedValue: '', typingStartTime: null })
        Swal.fire({
          title:
            '<span style="color:#ffca36;font-size: 24.5px;font-weight: 600;position: relative;right: 3.5rem;top: -1rem;">WOOT!<span>',
          html:
            '<span style="color:white;font-size: 15px;position:relative;top: -1rem;font-weight: 600;">Year score: <span>' +
            '<span style="color:#ffca36;font-size: 22px"><span>' +
            `${data.guess.year_score}`,
          width: 300,
          padding: '2em',
          background: '#321b47',
          backdrop: 'rgba(0,0,123,0.4)',
          showCloseButton: true,
          showConfirmButton: false,
          timer: 1500,
        })
        this.props.reset('guessForm')
      } else if (
        data.guess &&
        data.guess.title_score &&
        data.guess.title_score > 0 &&
        data.guess.artist_score > 0 &&
        this.state.titleScoreShown &&
        this.state.artistScoreShown
      ) {
        Swal.fire({
          position: 'center',
          type: 'warning',
          title: 'Wait for the next Song to Begin, Champ!!',
          showConfirmButton: false,
          timer: 1500,
        })
      } else if (this._timerEnd) {
        Swal.fire({
          position: 'center',
          type: 'warning',
          title: "Sorry, time's up!",
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          html:
            '<span style="color:red;font-size: 20.5px">NOPE<span>' +
            '<br>' +
            '<span style="color:#321b47;font-size: 12.5px">But guess again, you got this!<span>',
          width: 300,
          padding: '2em',
          background: '#ffca27',
          backdrop: 'rgba(0,0,123,0.4)',
          showCloseButton: true,
          showConfirmButton: false,
          timer: 1500,
        })
      }
    })
  }
  // alert1() {
  //   Swal.fire({
  //     html:
  //       '<span style="color:#321b47;font-size: 20.5px">WOW!<span>' +
  //       '<br>' +
  //       '<span style="color:#321b47;font-size: 12.5px">You\'re so flippin\' good, another player used their picks to slow you down for one song!</br>+1 Mute Badge<span>',
  //     width: 300,
  //     padding: '2em',
  //     background: '#ffca27',
  //     backdrop: 'rgba(0,0,123,0.4)',
  //     showCloseButton: true,
  //     showConfirmButton: false,
  //   })
  // }
  sendAnswer() {
    Swal.mixin({
      input: 'text',
      confirmButtonText: 'Send',
      showCancelButton: true,
      inputValidator: value => {
        return new Promise(resolve => {
          if (value) resolve()
          else resolve('Please enter Answer')
        })
      },
    })
      .queue([
        {
          title: 'Enter your Answer',
        },
      ])
      .then(result => {
        if (result.value && !localStorage['answered']) {
          localStorage['answered'] = true
          Swal.fire({
            position: 'center',
            type: 'success',
            title: 'Submitted Successfully!',
            showConfirmButton: false,
            timer: 1500,
          })
          this.props.postRequest('player/send_host_answer', {
            type: SEND_HOST_ANSWER,
            values: { player: { answer: result.value[0], id: this.props.player } },
          })
        } else {
          Swal.fire({
            position: 'center',
            type: 'warning',
            title: 'Already Answered!',
            showConfirmButton: false,
            timer: 1500,
          })
        }
      })
  }

  closeIcon() {
    document.getElementById('closeButton').style.display = 'none'
  }

  textInputChange(value){
    this.setState({ guessedValue: value, typingStartTime: this.props.song_status && !this.state.typingStartTime ? new Date().getTime() : this.state.typingStartTime })
  }

  _redeemOnce = true
  _timerEnd = false
  _animateOnce = false

  render() {
    const { reward, redeemed, guessedValue } = this.state
    const { handleSubmit, player_status, current_session } = this.props
    const { playerGuessing } = this.props.guess
    const { show_year_hint } = this.props.game
    const total_score = this.props.guess.total_score ? this.props.guess.total_score : 0
    const title_score =
      this.props.guess.guessData && this.props.guess.guessData ? this.props.guess.guessData.title_score : 0
    const artist_score =
      this.props.guess.guessData && this.props.guess.guessData ? this.props.guess.guessData.artist_score : 0
    const year_score =
      this.props.guess.guessData && this.props.guess.guessData ? this.props.guess.guessData.year_score : 0
    const title_hint = this.props.song && this.props.song.title
    const artist_hint = this.props.song && this.props.song.artist
    const year_hint = this.props.song && this.props.song.year
    const canGuess = (show_year_hint && (artist_score == 0 || year_score == 0)) || (!show_year_hint && (artist_score == 0 || title_score == 0))
    return (
      <div style={{ position: 'relative', paddingTop: player_status == 'muted' ? '100px' : '0px' }}>
        {this.props.player_status == 'muted' && this.props.song_status == true && (
          <div id="closeButton" className="yellow-header" style={{ marginBottom: 0 }}>
            <b>🔇 WOO! You're muted! You will get only half of the points for this song guesses!</b>
            <button style={{ background: 'transparent', border: 'none' }} onClick={this.closeIcon}>
              <i className="fa fa-close" />
            </button>
          </div>
        )}
        <Container
          style={{
            height: '60vh',
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
        >
          <Row
            middle="xs"
            center="xs"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: 'white', width: '100%' }}
          >
            <Col xs={12}>
              <button
                className="ss-btn"
                onClick={() => {
                  this.sendAnswer()
                }}
              >
                SS
              </button>
            </Col>
          </Row>
          {canGuess && (
            <Row>
              <Col sm="12" md={{ size: 6, offset: 3 }}>
                <div className="align-middle py-3">
                  <div style={{ width: current_session ? '85%' : '100%', marginTop: '1rem' }}>
                    <div className="custom-form">
                      <form onSubmit={handleSubmit(this.guessValues)}>
                        <Field
                          id="guessInput"
                          name="guess.title"
                          className="custom-form-field-w-label "
                          component={renderTextField}
                          label= {show_year_hint ? "ENTER SONG YEAR OR ARTIST" : "ENTER SONG TITLE OR ARTIST"}
                          type="text"
                          autoFocus
                          onChange={e => this.textInputChange(e.target.value)}
                        />
                        {guessedValue == '' && (
                        <div>
                          <Button
                            className="mayhem-btn-yellow"
                            block
                            type="submit"
                            style={{ marginTop: '2.1rem' }}
                            disabled
                          >
                            {playerGuessing ? 'Guessing...' : 'Guess'}
                          </Button>
                        </div>
                        )}
                        {guessedValue != '' && (
                        <div>
                          <button
                            type="button"
                            className="fa fa-remove"
                            style={{
                              position: 'relative',
                              top: '-4rem',
                              float: 'right',
                              background: ' none',
                              border: 'none',
                              color: 'white',
                            }}
                            onClick={e => {
                              this.props.changeFieldValue('guess.title', '')
                              this.setState({ guessedValue: e.target.value, typingStartTime: null })
                            }}
                          />
                          <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                            {playerGuessing ? 'Guessing...' : 'Guess'}
                          </Button>
                          </div>
                        )}
                      </form>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          margin: '1rem 0',
                          alignItems: 'center',
                        }}
                        >
                          <h6 style={{ fontWeight: 'bold' }}>ARTIST SCORE: {artist_score}</h6>
                          {!show_year_hint && <h6 style={{ fontWeight: 'bold' }}>TITLE SCORE: {title_score}</h6>}
                          {show_year_hint && <h6 style={{ fontWeight: 'bold' }}>YEAR SCORE: {year_score}</h6>}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
          {artist_score > 0 && ( title_score > 0 || year_score > 0 ) && (
            <div
              style={{
                height: '60vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: current_session ? '85%' : '100%',
              }}
            >
              <Row>
                <Col>
                  <h3 align="center" style={{ color: 'white' }}>
                    {INTERJECTION}
                  </h3>
                  <h5 align="center" style={{ color: 'white' }}>
                    You scored on both {show_year_hint ? 'Artist & Year' :  !show_year_hint ? 'Artist & Title' : 'Title & Year'}
                  </h5>{' '}
                </Col>
              </Row>
            </div>
          )}
          {reward == 'ticket' && <Tickets model {...this.props} pageState={p => this.setState({ reward: p })} spiffValue={this.props.spiffValue} />}
          {reward == 'pick' && (
            <Picks playerScreen={true} model {...this.props} pageState={p => this.setState({ reward: p })} sneakPeekRedeemed={redeemed} />
          )}
          {reward == 'spiff' && <Spiffs model {...this.props} pageState={p => this.setState({ reward: p })} />}
          {canGuess && redeemed && (
            <Row style={{ color: 'white' }}>
              <Col style={{ position: 'fixed', height: '6rem', top: '0', width: '85%' }} className="hint-css">
                <h5>TYPE QUICK!</h5>
                <p style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {' '}
                  ARTIST: <span style={{ color: 'yellow' }}>{artist_hint}</span>
                </p>
                {!show_year_hint && <p style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {' '}
                  TITLE: <span style={{ color: 'yellow' }}>{title_hint}</span>{' '}
                </p>}
                {show_year_hint && <p style={{ fontWeight: 'bold', fontSize: '12px' }}>
                  {' '}
                  YEAR: <span style={{ color: 'yellow' }}>{year_hint}</span>{' '}
                </p>}
              </Col>
            </Row>
          )}
          {this.PlayerProfile(
            this.props.player_name,
            artist_score + title_score + year_score,
            total_score,
            this.props.pusherCurrentSongCount
          )}
        </Container>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeFieldValue: (field, value) => {
      dispatch(change('guessForm', field, value))
    },
    playerGuess: (params, cb) => dispatch(playerGuess(params, cb)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

const UserGuessForm = reduxForm({
  form: 'guessForm',
  validate,
})(UserGuess)

export default connect(
  state => {
    return {
      guess: state.guess,
      account: state.account,
      initialValues: { guess: { title: '', player_id: '' } },
    }
  },
  mapDispatchToProps
)(UserGuessForm)
