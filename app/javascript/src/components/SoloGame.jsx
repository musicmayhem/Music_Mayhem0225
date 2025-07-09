import React from 'react'
import { FormGroup, Label, Input, FormFeedback, Container, Row, Col } from 'reactstrap'

import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { makeRequest } from '../actions/gameAction'
import { startSoloGame } from '../actions/soloGameActions'
import { GET_PLAYLIST_AND_AD_CAMP_SUCCESS } from '../constants/gameConstants'
import { checkUserIsLogin } from '../actions/loginActions'

const renderSelectField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input type="select" name="select" id="game_time_select" style={{ color: '#ffca27' }}>
      {custom.options}
    </Input>
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class HostGame extends React.Component {
  constructor(props) {
    super(props)
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch(checkUserIsLogin()).then(res => {
      if (res) this.props.makeRequest('games/generate_playlist', { type: GET_PLAYLIST_AND_AD_CAMP_SUCCESS })
      else
       this.props.history.push('/')
      })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.solo && nextProps.solo.solo_game && nextProps.solo.solo_game.code) {
      const game_code = nextProps.solo.solo_game.code
      this.props.history.push('/games/' + game_code)
    }
  }

  gameValues = values => {
    this.props.startSoloGame(values)
  }

  render() {
    const { playlist } = this.props.game
    const { handleSubmit } = this.props
    const { startSoloGame } = this.props.game
    return (
      <Container style={{ padding: '0 2rem', paddingBottom: '4rem' }}>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <div className="py-3">
              <div>
                <div>
                  <h4 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>PLAy A SOLO GAME</h4>
                  <form onSubmit={handleSubmit(this.gameValues)}>
                    <Field
                      name="game.playlist_id"
                      component={renderSelectField}
                      className="custom-form-field-w-label"
                      options={
                        playlist
                          ? playlist.map(p => (
                              <option key={p[0]} value={p[0]}>
                                {' '}
                                {p[1]}{' '}
                              </option>
                            ))
                          : ''
                      }
                      label="SELECT A PLAYLIST"
                    />
                    <button className="mayhem-btn-blue btn-full-width" type="submit">
                      {startSoloGame ? 'CREATING...' : 'PLAY NOW'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
    startSoloGame: params => dispatch(startSoloGame(params)),
  }
}

const HostGameForm = reduxForm({
  form: 'soloGameForm',
})(HostGame)

export default connect(
  state => {
    return {
      auth: state.auth,
      game: state.game,
      solo: state.solo,
    }
  },
  mapDispatchToProps
)(HostGameForm)
