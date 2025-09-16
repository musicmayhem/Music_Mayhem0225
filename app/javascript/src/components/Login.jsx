/* global window localStorage */
import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container, Row, Col, Alert } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { logInUser } from '../actions/loginActions'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { postRequest } from '../actions/gameAction'
import { RESEND_EMAIL_CONFIRMATION } from '../constants/authConstants'
import { checkUserIsLogin } from '../actions/loginActions'

const validate = values => {
  const errors = { account: {} }
  const userFields = ['login', 'password']

  userFields.forEach(field => {
    if (values['account'] && !values['account'][field]) {
      switch (field) {
        case 'login':
          errors['account'][field] = 'Username or Email is required'
          break
        case 'password':
          errors['account'][field] = 'Password is required'
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
      type={custom.type}
      onChange={input.onChange}
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class Login extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      rememberMe: true,
      showOnce: true,
    }
  }

  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) {
        this.props.history.push('/login')
      } else {
        localStorage.removeItem('indexImg')
        localStorage.removeItem('game_config_updated')
        localStorage.removeItem('game_updated')
        localStorage.removeItem('new_game_reset')
        localStorage.removeItem('answered')
        this.props.history.push('/index')
      }
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.showOnce &&
      nextProps.auth &&
      nextProps.auth.confirmation_status &&
      Object.keys(nextProps.auth.confirmation_status) &&
      Object.keys(nextProps.auth.confirmation_status).length > 0
    ) {
      this.setState({ showOnce: false })
      Swal.fire({
        position: 'center',
        type: 'success',
        title: 'Please check your Email!!',
        showConfirmButton: false,
        timer: 1500,
      })
    }
    if (nextProps.auth && nextProps.auth.accountLoggedIn && nextProps.auth.data) this.props.history.push('/index')
  }

  loginValues = values => {
    values['account']['remember_me'] = this.state.rememberMe
    this.props.logInUser(values)
  }

  confirmEmail = () => {
    Swal.mixin({
      input: 'email',
      confirmButtonText: 'Submit',
      showCancelButton: false,
    })
      .queue([
        {
          title: 'Enter your email to confirm',
        },
      ])
      .then(result => {
        if (result.value) {
          this.props.postRequest('player/resend_email_confirmation', {
            type: RESEND_EMAIL_CONFIRMATION,
            values: { email: result.value[0] },
          })
        }
      })
  }

  render() {
    const { handleSubmit } = this.props
    const { loggingIn } = this.props.auth
    return (
      <Container>
        <Row>
          <Col sm="12" md={{ size: 6, offset: 3 }}>
            <div className="align-middle py-3">
              {this.props.auth && this.props.auth.errors && <Alert color="danger">{this.props.auth.errors}</Alert>}
              <div>
                <div className="custom-form">
                  <h4 style={{ fontWeight: 'bold' }}>SIGN IN</h4>
                  <form onSubmit={handleSubmit(this.loginValues)}>
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
                    <div
                      className="remember-me"
                      onClick={() => {
                        this.setState({ rememberMe: !this.state.rememberMe })
                      }}
                    >
                      <div>{this.state.rememberMe && <i className="fa fa-check" />} </div>
                      <label>REMEMBER ME</label>
                    </div>
                    <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                      {loggingIn ? 'Logging in...' : 'Log in'}
                    </Button>
                    <Row center="xs" style={{ marginTop: '0.8rem' }}>
                      <Col xs={6} style={{ paddingRight: '0.4rem' }}>
                        <Button href={window.location.origin + '/fb'} className="mayhem-btn-fb btn-full-width">
                          SIGN IN WITH
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
                          SIGN IN WITH
                          <i
                            className="fa fa-twitter"
                            style={{ marginLeft: '10px', fontSize: '1.2rem', position: 'relative', bottom: '-0.1rem' }}
                          />
                        </Button>
                      </Col>
                    </Row>
                    <Row style={{ color: '#fff', marginTop: '2rem' }}>
                      <Col xs={4} style={{ borderRight: '1px solid #fff', textAlign: 'right' }}>
                        <Link to="/reset_password_email" className="mayhem-link-white">
                          <span>Forgot Password?</span>
                        </Link>
                      </Col>
                      <Col xs={4} style={{ borderRight: '1px solid #fff', textAlign: 'center' }}>
                        <Link to="/sign_up" className="mayhem-link-white">
                          <span>Register</span>
                        </Link>
                      </Col>
                      <Col xs={4}>
                        <a
                          className="mayhem-link-white"
                          onClick={() => {
                            this.confirmEmail()
                          }}
                        >
                          Resend Confirmation?
                        </a>
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
    logInUser: params => dispatch(logInUser(params)),
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

const LoginForm = reduxForm({
  form: 'loginForm',
  validate,
})(Login)

export default connect(
  state => {
    return {
      auth: state.auth,
      initialValues: { account: { login: '', password: '', remember_me: true } },
    }
  },
  mapDispatchToProps
)(LoginForm)
