import React from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { userDashboard, inviteUser } from '../actions/indexActions'
import { connect } from 'react-redux'
import UserPicture from './UserPicture'
import { Link } from 'react-router-dom'
import Guitar from '../images/icon_guitar.svg'
import PlanSnippet from './PlanSnippet'
import Alerter from './Alerter'
import { Field, FieldArray, reduxForm } from 'redux-form'
import { checkUserIsLogin } from '../actions/loginActions'

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

const renderEmailFields = ({ fields }) => (
  <ul className="invite-user">
    {fields.map((acc, index) => (
      <li key={index} style={{ width: '100%' }}>
        <Field
          name={`${acc}.email`}
          component={renderTextField}
          className="custom-form-field-w-label"
          label="Your Friend’s Email Address"
          type="email"
        />
        <div className="btn-container">
          <button className="mayhem-btn-red" type="button" onClick={() => fields.remove(index)}>
            <i className="fa fa-times" />
            Remove
          </button>
        </div>
      </li>
    ))}
    <button
      type="button"
      style={{ marginTop: fields.length != 0 ? '-15px' : '0' }}
      className="mayhem-btn-green"
      onClick={() => fields.push({})}
    >
      <i className="fa fa-plus" />
      Add Another Friend
    </button>
  </ul>
)

class Main extends React.Component {
  constructor(props) {
    super(props)
  }

  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.userDashboard()
    })
  }

  emailValues = values => {
    this.props.inviteUser(values)
  }

  render() {
    const { handleSubmit } = this.props
    const { username, logo, current_account, inviteSending } = this.props.index
    let user = {
      avatar: logo,
      username: username,
    }
    let plan = {
      plan_desc: 'You have the additional ability to create games for up to 10 people with weekly updated playlists',
      plan_name: 'Personal Plan - $2/Month',
      plan_img: Guitar,
    }

    return (
      <Container>
        <Row center="xs">
          <Col xs={12} style={{ padding: 0 }}>
            <div style={{ marginTop: '10rem', background: 'white' }}>
              <UserPicture user={user} />
              <Container style={{ background: 'white' }} className="user-desc">
                <div center="xs" style={{ borderTop: '1px solid #aaa', margin: '0 0.8rem' }}>
                  <p>{current_account ? current_account.name : ''}</p>
                  <p>{current_account ? current_account.email : ''}</p>
                  <p>{current_account ? current_account.username : ''}</p>
                </div>
                <div center="xs" style={{ borderBottom: '1px solid #aaa', margin: '0 0.8rem' }}>
                  <p>
                    {current_account ? current_account.state : ''}, {current_account ? current_account.city : ''},{' '}
                    {current_account ? current_account.zip_code : ''}
                  </p>
                  <p>
                    {current_account && current_account.phone ? (
                      current_account.phone
                    ) : (
                      <span>
                        <span style={{ marginRight: 3 }}>No phone listed -</span>
                        <Link className="mayhem-link" to="/accounts/setting">
                          Add
                        </Link>
                      </span>
                    )}
                  </p>
                </div>
              </Container>
              <div style={{ background: 'white', padding: '1rem' }}>
                <a href="/accounts/setting" className="mayhem-link">
                  Edit My Info & Password
                </a>
              </div>
              <div className="plan-container" style={{ padding: '2rem 1rem' }}>
                <h3 className="font-light">My Plan</h3>
                <PlanSnippet plan={plan} />
                <div style={{ paddingBottom: '2rem' }}>
                  <a href="/plan" className="mayhem-link">
                    Change plan
                  </a>
                </div>
              </div>
              <div className="invite-container">
                <h3 style={{ textAlign: 'left' }}>Invite Friends</h3>
                {this.props.index && this.props.index.response && (
                  <Alerter type={'success'} time={4000} message={this.props.index.response.response} />
                )}
                <form onSubmit={handleSubmit(this.emailValues)}>
                  <Field
                    name="account[0][email]"
                    className="custom-form-field-w-label"
                    component={renderTextField}
                    label="Your Friend’s Email Address"
                    type="email"
                    autoFocus
                  />
                  <FieldArray name="accounts" component={renderEmailFields} />
                  <Button className="mayhem-btn-yellow" block type="submit" style={{ marginTop: '0.5rem' }}>
                    {inviteSending ? 'Inviting...' : 'Invite Friends'}
                  </Button>
                </form>
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
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    userDashboard: () => dispatch(userDashboard()),
    inviteUser: params => dispatch(inviteUser(params)),
  }
}

const InviteForm = reduxForm({
  form: 'inviteForm',
})(Main)

export default connect(
  state => {
    return {
      auth: state.auth,
      index: state.index,
    }
  },
  mapDispatchToProps
)(InviteForm)
