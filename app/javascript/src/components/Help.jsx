import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container } from 'reactstrap'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import Cup from '../images/icon_stopwatch.svg'
import Alerter from './Alerter'
import { sendingFeedback } from '../actions/feebackActions'

const validate = values => {
  const errors = { feedback: {} }

  const userFields = ['email', 'name', 'message']

  userFields.forEach(field => {
    if (values['feedback'] && !values['feedback'][field]) {
      switch (field) {
        case 'email':
          errors['feedback'][field] = 'Email is required'
          break
        case 'name':
          errors['feedback'][field] = 'Name is required'
          break
        case 'message':
          errors['feedback'][field] = 'MESSAGE is required'
          break
      }
    }
  })
  return errors
}

const renderSelectField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input type="select" name="select" id="state_select" style={{ color: '#fff', fontSize: '1rem' }}>
      <option> SEND FEEDBACK</option>
      <option> SUBMIT IDEA </option>
      <option> REPORT ERROR </option>
    </Input>
  </FormGroup>
)

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input
      type={custom.type}
      onChange={input.onChange}
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class Feedback extends React.Component {
  UNSAFE_componentWillMount() {
    if (this.props.loggedIn) this.props.history.push('/index')
  }

  feedbackValues = values => {
    this.props.sendingFeedback(values)
  }

  render() {
    const { handleSubmit } = this.props
    const { sendingFeedback } = this.props.feedback
    return (
      <Container>
        <Row center="xs">
          <Col xs={12}>
            <h2 style={{ fontWeight: 'bold', margin: '1rem 0', color: '#fff' }}>GET HELP</h2>
          </Col>
        </Row>
        <Row center="xs" style={{ background: '#fff', padding: '1rem 0' }}>
          <Col xs={12} style={{ padding: 0 }}>
            <div style={{ marginTop: 10 }}>
              <h6 style={{ fontWeight: 'normal' }}>We want to hear from you!  Tell us about any issues, questions or ideas so we can make the game better!</h6>
            </div>
          </Col>
        </Row>
        <Row start="xs" className="purple-background" style={{ padding: '2rem 0' }}>
          <Col sm={12}>
            <div>
              {this.props.feedback && this.props.feedback.feedbackSend && (
                <Alerter type="success">Thanks, Your Feedback Is Important!</Alerter>
              )}
              <div>
                <div className="custom-form">
                  <form onSubmit={handleSubmit(this.feedbackValues)}>
                    <Field
                      name="feedback.name"
                      className="custom-form-field-w-label"
                      component={renderTextField}
                      label="YOUR NAME"
                      type="text"
                    />
                    <Field
                      name="feedback.email"
                      className="custom-form-field-w-label"
                      component={renderTextField}
                      label="EMAIL ADDRESS"
                      type="email"
                      autoFocus
                    />
                    <Field
                      name="feedback.type"
                      component={renderSelectField}
                      className="custom-form-field-w-label"
                      label="PURPOSE"
                    />
                    <Field
                      name="feedback.message"
                      className="custom-form-field-w-label"
                      component={renderTextField}
                      label="YOUR MESSAGE"
                      autoFocus
                    />
                    <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                      {sendingFeedback ? 'SENDING...' : 'SEND MESSAGE'}
                    </Button>
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
    sendingFeedback: params => dispatch(sendingFeedback(params)),
  }
}

const FeedbackForm = reduxForm({
  form: 'feedbackForm',
  validate,
})(Feedback)

export default connect(
  state => {
    return {
      auth: state.auth,
      feedback: state.feedback,
    }
  },
  mapDispatchToProps
)(FeedbackForm)
