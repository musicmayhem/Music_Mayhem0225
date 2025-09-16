import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { playerGuess, resetState } from '../actions/guessCheckerActions'
import Swal from 'sweetalert2'
import { postRequest } from '../actions/gameAction'
import { GET_DEMO_DATA } from '../constants/gameConstants'

const validate = values => {
  const errors = { guess: {} }
  const userFields = ['player_guess']

  userFields.forEach(field => {
    if (values['guess'] && !values['guess'][field]) {
      switch (field) {
        case 'player_guess':
          errors['guess'][field] = 'guess value is required'
          break
      }
    }
  })
  return errors
}

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input
      id="guessField"
      onChange={input.onChange}
      value={input.value}
      type={custom.type}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class UserGuess extends React.Component {
  state = {
    artistScoreShown: false,
    titleScoreShown: false,
  }

  UNSAFE_componentWillMount() {
    this.props.postRequest('player/get_demo_data', {
      type: GET_DEMO_DATA,
      values: { game: { code: this.props.game.code } },
    })
  }

  guessValues = values => {
    values['formName'] = this.props.form
    values['guess']['player_id'] = this.props.player.player.id
    this.props.playerGuess(values, data => {
      if (data.guess && data.guess.artist_score && data.guess.artist_score > 0 && !this.state.artistScoreShown) {
        this.setState({ artistScoreShown: true })
        Swal.fire({
          position: 'center',
          type: 'success',
          title: `Artist Score: ${data.guess.artist_score}`,
          showConfirmButton: false,
          timer: 1500,
        })
      } else if (data.guess && data.guess.title_score && data.guess.title_score > 0 && !this.state.titleScoreShown) {
        this.setState({ titleScoreShown: true })
        Swal.fire({
          position: 'center',
          type: 'success',
          title: `Title Score: ${data.guess.title_score}`,
          showConfirmButton: false,
          timer: 1500,
        })
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
          title: 'Wait for the next Song to Begin Champ!!',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        Swal.fire({
          position: 'center',
          type: 'error',
          title: 'Wrong Answer!',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    })
  }

  render() {
    const { handleSubmit } = this.props
    const { playerGuessing } = this.props.guess
    const total_score = this.props.guess.total_score ? this.props.guess.total_score : 0
    const title_score =
      this.props.guess.guessData && this.props.guess.guessData ? this.props.guess.guessData.title_score : 0
    const artist_score =
      this.props.guess.guessData && this.props.guess.guessData ? this.props.guess.guessData.artist_score : 0
    return (
      <div className="align-middle py-3">
        <div>
          <div className="custom-form">
            <form onSubmit={handleSubmit(this.guessValues)}>
              <Field
                name="guess.player_guess"
                className="custom-form-field-w-label "
                component={renderTextField}
                label="ENTER SONG TITLE OR ARTIST"
                type="text"
                autoFocus
              />
              <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                {playerGuessing ? 'Guessing...' : 'GUESS'}
              </Button>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', alignItems: 'center' }}>
                <h6 style={{ fontWeight: 'bold' }}>SONG SCORE: {title_score + artist_score}</h6>
                <h6 style={{ fontWeight: 'bold' }}>TOTAL SCORE: {total_score}</h6>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    playerGuess: (params, cb) => dispatch(playerGuess(params, cb)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
    resetState: () => dispatch(resetState()),
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
      player: state.player,
      initialValues: { guess: { player_guess: '', player_id: '' } },
    }
  },
  mapDispatchToProps
)(UserGuessForm)
