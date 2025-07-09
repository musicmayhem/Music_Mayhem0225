import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import { Row, Col } from 'react-flexbox-grid'

const validate = values => {
  const errors = { account: {} }

  const accountFields = ['email', 'username']

  accountFields.forEach(field => {
    if (values['account'] && !values['account'][field]) {
      switch (field) {
        case 'email':
          errors['account'][field] = 'Email is required'
          break
        case 'username':
          errors['account'][field] = 'Username is required'
          break
      }
    }
    if (values['account'] && values['account']['username'] && !/^\S+$/.test(values['account']['username']))
      errors['account']['username'] = 'space is not allowed in username'

    if (
      values['account'] &&
      values['account']['email'] &&
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values['account']['email'])
    )
      errors['account']['email'] = 'Invalid email address'
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
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class RegistrationForm extends React.Component {
  UNSAFE_componentWillMount() {
    this.props.getGuestName(true)
  }
  joinGame(name) {
    this.props.creatGuest(true, name)
  }
  render() {
    let guest_name = this.props.auth && this.props.auth.name
    const { handleSubmit } = this.props
    const { creatingAccount } = this.props.auth
    return (
      <form onSubmit={handleSubmit(this.props.registrationValues)}>
        <Col xs={12}>
          <Row style={{ color: '#ffca27' }}>
            <h4 style={{ fontSize: '1rem' }} className="font-light">
              YOUR TEMPORARY USERNAME IS:
            </h4>
          </Row>
          <Row style={{ color: '#ffca27', fontSize: '0.9rem' }}>
            <h4 className="font-light">{guest_name}</h4>
          </Row>
          <Row>
            <p style={{ color: '#ccc' }}>
              To customize your username, save scores and more, just enter your desired username and email (its free!)
            </p>
          </Row>
          <div style={{ marginLeft: '-1rem' }}>
            <Field
              name="account.username"
              className="custom-form-field-w-label "
              component={renderTextField}
              label="DESIRED USERNAME"
              type="text"
              autoFocus
            />
            <Field
              name="account.email"
              className="custom-form-field-w-label"
              component={renderTextField}
              label="EMAIL ADDRESS"
              type="email"
            />
            <Button style={{ fontWeight: '600' }} color="info" size="lg" block type="submit">
              {creatingAccount ? 'CREATING...' : 'CREATE MY ACCOUNT'}
            </Button>
            <p style={{ color: '#ccc' }}>
              <i>We do not sell or share any personal info.</i>
            </p>
          </div>
          <div style={{ margin: '1rem', textAlign: 'center' }} className="pink-link">
            <a
              onClick={() => {
                this.joinGame(guest_name)
              }}
            >
              JUST TAKE ME TO THE GAME
            </a>
          </div>
        </Col>
      </form>
    )
  }
}

const RegistrationFormValues = reduxForm({
  form: 'registrationForm',
  validate,
})(RegistrationForm)

export default RegistrationFormValues
