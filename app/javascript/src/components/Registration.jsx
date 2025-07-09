import React from 'react'
import { FormGroup, Label, Input, FormFeedback, Button, Container, Row, Col, Alert } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { createUser } from '../actions/registrationActions'
import { Link } from 'react-router-dom'

const validate = values => {
  const errors = { account: {} }
  const accountFields = ['name', 'email', 'username', 'password', 'password_confirmation']
  accountFields.forEach(field => {
    if (values['account'] && !values['account'][field]) {
      switch (field) {
        case 'name':
          errors['account'][field] = 'Name is required'
          break
        case 'email':
          errors['account'][field] = 'Email is required'
          break
        case 'username':
          errors['account'][field] = 'Username is required'
          break
        case 'password_confirmation':
          errors['account'][field] = 'Password Confirmation is required'
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

    if (values['account'] && values['account']['password'] && values['account']['password_confirmation']) {
      if (values['account']['password'] !== values['account']['password_confirmation']) {
        errors['account']['password_confirmation'] = 'Password do not match'
        errors['account']['password'] = 'Password do not match'
      }
    }
    if (values['account'] && values['account']['username'] && !/^[a-zA-Z0-9_.]*$/i.test(values['account']['username']))
      errors['account']['username'] = "Invalid Username(Prevnt '@')"
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

class Registration extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth && nextProps.auth.data && nextProps.auth.data.email) this.props.history.push('/index')
  }
  registrationValues = values => {
    this.props.createUser(values)
  }
  render() {
    const { handleSubmit } = this.props
    const { creatingAccount } = this.props.auth
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <div className="align-middle py-3">
              {this.props.auth.data && <Alert color="success">Registration success</Alert>}
              {this.props.auth && this.props.auth.errors && <Alert color="danger">{this.props.auth.errors}</Alert>}
              <div>
                <div className="custom-form">
                  <h4 style={{ fontWeight: 'bold' }}>JOIN MAYHEM</h4>
                  <form onSubmit={handleSubmit(this.registrationValues)}>
                    <Field
                      name="account.name"
                      className="custom-form-field-w-label "
                      component={renderTextField}
                      label="First Name"
                      type="text"
                      autoFocus
                    />
                    <Field
                      name="account.email"
                      className="custom-form-field-w-label "
                      component={renderTextField}
                      label="Email Address"
                      type="email"
                    />
                    <Field
                      name="account.username"
                      className="custom-form-field-w-label "
                      component={renderTextField}
                      label="Username"
                      type="text"
                    />
                    <Field
                      name="account.password"
                      className="custom-form-field-w-label "
                      component={renderTextField}
                      label="Password"
                      type="password"
                    />
                    <Field
                      name="account.password_confirmation"
                      className="custom-form-field-w-label "
                      component={renderTextField}
                      label="Re-enter Password"
                      type="password"
                    />
                    <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                      {creatingAccount ? 'CREATING...' : 'CREATE ACCOUNT'}
                    </Button>
                    <Row center="xs" style={{ marginTop: '0.8rem' }}>
                      <Col xs={6} style={{ paddingRight: '0.4rem' }}>
                        <Button href={window.location.origin + '/fb'} className="mayhem-btn-fb btn-full-width">
                          JOIN WITH
                          <i
                            style={{ marginLeft: '10px', fontSize: '1.2rem', position: 'relative', bottom: '-0.1rem' }}
                            className="fa fa-facebook"
                          />
                        </Button>
                      </Col>
                      <Col xs={6} style={{ paddingLeft: '0.4rem' }}>
                        <Button
                          className="mayhem-btn-twitter btn-full-width"
                          href={window.location.origin + '/twitter'}
                        >
                          JOIN WITH
                          <i
                            className="fa fa-twitter"
                            style={{ marginLeft: '10px', fontSize: '1.2rem', position: 'relative', bottom: '-0.1rem' }}
                          />
                        </Button>
                      </Col>
                    </Row>
                    <Row center="xs" style={{ color: '#fff', marginTop: '2rem', marginBottom: '2rem' }}>
                      <Col xs={12} style={{ textAlign: 'center' }}>
                        <Link to="/login" className="mayhem-link-white">
                          Already A Member?
                        </Link>
                        <br />
                      </Col>
                    </Row>
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
    createUser: params => dispatch(createUser(params)),
  }
}

const RegistrationForm = reduxForm({
  form: 'registrationForm',
  validate,
})(Registration)

export default connect(
  state => {
    return {
      auth: state.auth,
      initialValues: {
        account: { name: '', username: '', password_confirmation: '', email: '', password: '' },
      },
    }
  },
  mapDispatchToProps
)(RegistrationForm)
