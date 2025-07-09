import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import { Link } from 'react-router-dom'

const validate = values => {
  const errors = { account: {} }

  const accountFields = ['email', 'password']

  accountFields.forEach(field => {
    if (values['account'] && !values['account'][field]) {
      switch (field) {
        case 'email':
          errors['account'][field] = 'Email is required'
          break
        case 'password':
          errors['account'][field] = 'Password is required'
          break
      }
    }
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

const renderCheckBoxField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="game-config-checkbox-css">
    <Label style={{ margin: '0.4rem 1rem', fontSize: 'large' }}>{label}</Label>
    <Input
      {...input}
      {...custom}
      type={custom.type}
      value={input.value}
      checked={input.checked}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      style={{ color: '#ffca27' }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class LoginForm extends React.Component {
  render() {
    const { handleSubmit } = this.props
    const { loggingIn } = this.props.auth
    return (
      <div>
        <form onSubmit={handleSubmit(this.props.loginValues)}>
          <Field
            name="account.login"
            className="custom-form-field-w-label "
            component={renderTextField}
            label="USERNAME OR EMAIL ADDRESS"
            type="text"
            autoFocus
          />
          <Field
            name="account.password"
            className="custom-form-field-w-label"
            component={renderTextField}
            label="Password"
            type="password"
          />
          <Field
            name="account.remember_me"
            component={renderCheckBoxField}
            label="Remember me"
            type="checkbox"
            checked={true}
          />
          <Button style={{ fontWeight: 'bold' }} color="info" size="lg" block type="submit">
            {loggingIn ? 'JOINING...' : 'JOIN GAME'}
          </Button>
        </form>
        <div style={{ margin: '1rem', textAlign: 'center' }}>
          <Link to="/reset_password_email" className="mayhem-link-white">
            <span>Forgot Password?</span>
          </Link>
        </div>
      </div>
    )
  }
}

const LoginFormValues = reduxForm({
  form: 'loginForm',
  validate,
})(LoginForm)

export default LoginFormValues
