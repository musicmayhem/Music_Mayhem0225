/* global window */
import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container, Row, Col, Alert } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { changePassword } from '../actions/passwordActions'

const validate = values => {
  const errors = { account: {} }

  const accountFields = ['password', 'password_confirmation']

  accountFields.forEach(field => {
    if (values['account'] && !values['account'][field]) {
      switch (field) {
        case 'password':
          errors['account'][field] = 'New Password is required'
          break
        case 'password_confirmation':
          errors['account'][field] = 'Confirm New Password is required'
          break
      }
    }
    if (values['account'] && values['account']['password'] && values['account']['password_confirmation']) {
      if (values['account']['password'] !== values['account']['password_confirmation']) {
        errors['account']['password'] = 'Password do not match'
        errors['account']['password_confirmation'] = 'Password do not match'
      }
    }
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

class ChangePassword extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.password && nextProps.password.success) this.props.history.push('/index')
  }

  passwordValues = values => {
    this.props.changePassword(values)
  }

  render() {
    const { handleSubmit } = this.props
    const { changingPassword } = this.props.password

    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <div className="align-middle py-5">
              {this.props.password && this.props.password.errors && (
                <Alert color="danger">{this.props.password.errors}</Alert>
              )}
              <div>
                <div className="custom-form">
                  <h4>CHANGE YOUR PASSWORD</h4>
                  <form onSubmit={handleSubmit(this.passwordValues)}>
                    <Field
                      name="account.password"
                      className="custom-form-field-yellow-w-label"
                      component={renderTextField}
                      label="New Password"
                      type="password"
                      autoFocus
                    />
                    <Field
                      name="account.password_confirmation"
                      className="custom-form-field-yellow-w-label"
                      component={renderTextField}
                      label="Confirm New Password"
                      type="password"
                    />
                    <Button outline color="warning" size="lg" block type="submit">
                      {changingPassword ? 'CONFIRMING...' : 'CONFIRM PASSWORD CHANGE'}
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
    changePassword: params => dispatch(changePassword(params)),
  }
}

const PasswordForm = reduxForm({
  form: 'passwordform',
  validate,
})(ChangePassword)

export default connect(
  state => {
    const reset_password_token = window.location.search.split('=')[1]
    return {
      auth: state.auth,
      password: state.password,
      initialValues: {
        account: { reset_password_token: reset_password_token },
      },
    }
  },
  mapDispatchToProps
)(PasswordForm)
