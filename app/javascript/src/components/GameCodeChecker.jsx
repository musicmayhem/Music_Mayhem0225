/* global window */
import React from 'react'
import { FormGroup, Label, Input, FormFeedback, Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { gameCodeCheck } from '../actions/gameCodeActions'
import Alerter from './Alerter'

const validate = values => {
  const errors = { game: {} }

  const gameField = ['game_code']

  gameField.forEach(field => {
    if (values['game'] && !values['game'][field]) {
      switch (field) {
        case 'game_code':
          errors['game'][field] = 'Game Code is required'
          break
      }
    }
    if (values['game'] && values['game']['game_code'] && !/^[a-zA-Z]{3}$/.test(values['game']['game_code']))
      errors['game']['game_code'] = 'Only three alphabets code allowed'
  })

  return errors
}

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input
      type={custom.type}
      onChange={input.onChange}
      value={input.value}
      invalid={touched && error ? true : false}
      style={{ textTransform: 'uppercase' }}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class GameCodeChecker extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      nextProps.game_code &&
      nextProps.game_code.game &&
      nextProps.game_code.game.game_exist !== 'Invalid Game Code' &&
      !this._checkGameCode
    ) {
      const game_code = nextProps.game_code.game.game_exist.code
      this._checkGameCode = true
      if (this.props.monitor) window.location = '/mirror/' + game_code
      else if (
        nextProps.auth.currentAccount &&
        nextProps.game_code.game.game_exist.account_id === nextProps.auth.currentAccount.id
      )
        window.location = '/config/' + game_code
      else nextProps.history.push('/players/' + game_code)
    }
  }

  _checkGameCode = false

  gameValues = values => {
    this.props.gameCodeCheck(values)
  }

  render() {
    const { handleSubmit } = this.props
    const { gameCodeChecking } = this.props.game_code
    const { buttonText, changedButtonText } = this.props
    return (
      <Container>
        <Row center="xs" style={{ color: '#fff' }}>
          <Col xs={12} md={6}>
            {this.props.game_code &&
              this.props.game_code.game &&
              this.props.game_code.game.game_exist == 'Invalid Game Code' && (
                <Alerter type={'error'} message={this.props.game_code.game.game_exist}>
                  {this.props.game_code.game.game_exist}
                </Alerter>
              )}
            <p style={{ margin: '1.7rem 0 0 0', fontSize: '0.9rem' }}>ENTER GAME CODE</p>
            <form onSubmit={handleSubmit(this.gameValues)}>
              <Field
                style={{ marginTop: '10px' }}
                className="custom-form-field"
                pattern="[A-Za-z]{3}"
                name="game.game_code"
                component={renderTextField}
                type="text"
                autoFocus
              />
              <button className="mayhem-btn-blue" type="submit" style={{ marginTop: '0.5rem' }}>
                {gameCodeChecking ? changedButtonText : buttonText}
              </button>
            </form>
          </Col>
        </Row>
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    gameCodeCheck: params => dispatch(gameCodeCheck(params)),
  }
}

const GameCodeForm = reduxForm({
  form: 'gameCodeForm',
  validate,
})(GameCodeChecker)

export default connect(
  state => {
    return {
      game_code: state.game_code,
      auth: state.auth,
      initialValues: { game: { game_code: '' } },
    }
  },
  mapDispatchToProps
)(GameCodeForm)
