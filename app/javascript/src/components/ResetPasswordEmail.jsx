import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container, Row, Col, Alert } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { resendPasswordInstruction } from '../actions/passwordActions'
import Swal from 'sweetalert2'

const validate = values => {
  const errors = {}

  const accountFields = ['email']

  accountFields.forEach(field => {
    if (!values[field]) {
      switch (field) {
        case 'email':
          errors[field] = 'Email is required'
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

class ResetPasswordInstruction extends React.Component {
  UNSAFE_componentWillReceiveProps(np) {
    if (
      this.props.password &&
      !this.props.password.password_reset_mail_send &&
      np.password &&
      np.password.password_reset_mail_send
    ) {
      Swal({
        position: 'center',
        type: 'success',
        title: 'Mail Sent Successfully!',
        showConfirmButton: false,
        timer: 1500,
      })
      this.props.reset('resetpasswordForm')
    }
  }

  emailValues = values => {
    this.props.resendPasswordInstruction({ account: values })
  }

  render() {
    const { handleSubmit } = this.props
    const { sending_password_reset_mail } = this.props.password
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
                  <h4>RESET PASSWORD</h4>
                  <form onSubmit={handleSubmit(this.emailValues)}>
                    <Field
                      name="email"
                      className="custom-form-field-yellow-w-label"
                      component={renderTextField}
                      label="Email"
                      type="email"
                      autoFocus
                    />
                    <Button outline color="warning" size="lg" block type="submit">
                      {sending_password_reset_mail ? 'SENDING...' : 'SEND RESET EMAIL'}
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
    resendPasswordInstruction: params => dispatch(resendPasswordInstruction(params)),
  }
}

const ResetPasswordInstructionForm = reduxForm({
  form: 'resetpasswordForm',
  validate,
})(ResetPasswordInstruction)

export default connect(
  state => {
    return {
      auth: state.auth,
      password: state.password,
    }
  },
  mapDispatchToProps
)(ResetPasswordInstructionForm)
