import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container, Row, Col, Alert } from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import { accountUpdate } from '../actions/accountAction'
import { checkUserIsLogin } from '../actions/loginActions'
import Loader from './Loader'
import { makeRequest } from '../actions/gameAction'
import { ACCOUNT_SETTING } from '../constants/indexConstants'

let era = {
  'Before 1950': false,
  '1950s': false,
  '1960s': false,
  '1970s': false,
  '1980s': false,
  '1990s': false,
  '2000s': false,
  '2010s': false,
}
let genre = {
  Rock: false,
  'Rap/Hip Hop': false,
  Pop: false,
  Jazz: false,
  Funk: false,
  Soul: false,
  Blues: false,
  Disco: false,
  Oldies: false,
  Country: false,
  Reggae: false,
  Alternative: false,
}

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
      autoFocus={custom.autoFocus}
      onChange={input.onChange}
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)
const renderCheckBoxField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="game-config-checkbox-css" style={{ color: 'grey' }}>
    <Label style={{ margin: '0.4rem 1rem', fontSize: 'large' }}>{label}</Label>
    <Input
      {...input}
      {...custom}
      type="checkbox"
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      style={{ color: '#ffca27' }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)
const renderImageField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup
    className="image-uploader"
    style={{
      backgroundSize: 'cover',
      backgroundImage: 'linear-gradient(#ffffff22, #eeeeee77), url(' + custom.imageurl + ')',
    }}
    {...input}
    {...custom}
  >
    <Label>{label}</Label>
    <i className="fa fa-camera" />
    <Input type="file" name="file" id="user_profile" />
  </FormGroup>
)

class AccountEdit extends React.Component {
  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.makeRequest('games/account_setting', { type: ACCOUNT_SETTING })
    })
    var url = new URL(window.location.href)
    if (url.searchParams.get('focus')) this._focus = true
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.index && !this.props.index.userEra && nextProps.index.userEra) {
      era = Object.keys(nextProps.index.userEra).length !== 0 ? nextProps.index.userEra : era
      genre = Object.keys(nextProps.index.userGenre).length !== 0 ? nextProps.index.userGenre : genre
    }

    if (nextProps.account && nextProps.account.accountUpdated) {
      var url = new URL(window.location.href)
      var code = url.searchParams.get('code')
      if (code) this.props.history.push('/player/' + code)
      else this.props.history.push('/index')
    }
  }

  accountValues = values => {
    if (values['account'] && values['account']['logo'] && values['account']['logo'].length == 0)
      delete values.account.logo
    this.props.accountUpdate(values)
  }
  _focus = false
  render() {
    const { handleSubmit } = this.props
    const { current_account, percent, current_account_logo } = this.props.index
    const { accountUpdating } = this.props.account
    return (
      <Container>
        {this.props.index.indexLoading && <Loader />}
        {!this.props.index.indexLoading && (
          <Row center="xs">
            <Col xs={12} style={{ padding: 0 }}>
              <div className="py-0">
                {this.props.account && this.props.account.errors && (
                  <Alert color="danger">{this.props.account.errors}</Alert>
                )}
                <div>
                  <div className="custom-form-white">
                    <h4 style={{ fontWeight: 'bold', padding: '1.2rem 0' }}>MY INFORMATION</h4>
                    <form onSubmit={handleSubmit(this.accountValues)}>
                      <div className="progress-bar-custom">
                        <div style={{ width: percent + '%', color: '#fff' }}>{percent + '%'} COMPLETE</div>
                      </div>
                      <div className="user-div">
                        <div className="user-logo">
                          <Field
                            name="account.logo"
                            component={renderImageField}
                            imageurl={current_account_logo ? current_account_logo : ''}
                            label="SELECT PHOTO"
                          />
                        </div>
                      </div>
                      {this._focus && (
                        <Field
                          name="account.password"
                          component={renderTextField}
                          label="Password"
                          className="custom-form-field-w-label-white "
                          placeholder="create password to continue"
                          type="password"
                          autoFocus={this._focus}
                        />
                      )}
                      {this._focus && (
                        <Field
                          name="account.password_confirmation"
                          component={renderTextField}
                          label="Password Confirmation"
                          className="custom-form-field-w-label-white "
                          placeholder="re-enter password"
                          type="password"
                        />
                      )}
                      {current_account && (
                        <div>
                          <Field
                            name="account.name"
                            component={renderTextField}
                            label="First Name"
                            className="custom-form-field-w-label-white "
                            placeholder={current_account.name}
                            type="text"
                            autoFocus={!this._focus}
                          />
                          <Field
                            name="account.last_name"
                            component={renderTextField}
                            label="Last Name"
                            className="custom-form-field-w-label-white "
                            placeholder={current_account.last_name}
                            type="text"
                          />
                          <Field
                            name="account.email"
                            component={renderTextField}
                            label="Email"
                            className="custom-form-field-w-label-white "
                            placeholder={current_account.email}
                            type="email"
                          />
                          <Field
                            name="account.username"
                            component={renderTextField}
                            label="Username"
                            className="custom-form-field-w-label-white "
                            placeholder={current_account.username}
                            type="text"
                          />
                          <Row>
                            <Col xs="6">
                              <b>Era: </b>
                              {era &&
                                Object.entries(era).map(x => (
                                  <Field
                                    key={x[0]}
                                    id={x[0]}
                                    name={`account.user_era.${x[0]}`}
                                    component={renderCheckBoxField}
                                    label={x[0]}
                                    defaultChecked={x[1] == 'true'}
                                  />
                                ))}
                            </Col>
                            <Col xs="6">
                              <b>Genre: </b>
                              {genre &&
                                Object.entries(genre).map(x => (
                                  <Field
                                    key={x[0]}
                                    id={x[0]}
                                    name={`account.user_genre.${x[0]}`}
                                    component={renderCheckBoxField}
                                    label={x[0]}
                                    defaultChecked={x[1] == 'true'}
                                  />
                                ))}
                            </Col>
                          </Row>
                        </div>
                      )}

                      <Button className="mayhem-btn-yellow" size="lg" block type="submit">
                        {accountUpdating ? 'UPDATING' : 'UPDATE'}
                      </Button>
                    </form>
                    <div
                      style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        marginTop: '1rem',
                        paddingTop: '1.5rem',
                        paddingBottom: '2rem',
                        borderTop: '2px solid #F2F2F2',
                      }}
                    >
                      <a href="/reset_password_email" className="mayhem-link">
                        Request a password change
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    accountUpdate: params => dispatch(accountUpdate(params)),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
  }
}

const AccountSettingForm = reduxForm({
  form: 'accountUpdateForm',
  enableReinitialize: true,
  multipartForm : true,
  validate,
})(AccountEdit)

export default connect(
  state => {
    return {
      auth: state.auth,
      account: state.account,
      index: state.index,
      initialValues: {
        account: {
          user_era: era,
          user_genre: genre,
        },
      },
    }
  },
  mapDispatchToProps
)(AccountSettingForm)
