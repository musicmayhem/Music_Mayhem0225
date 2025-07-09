import React, { Component } from 'react'
import { Button, FormGroup, Label, Input, FormFeedback, Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import Cup from '../images/icon_stopwatch.svg'
import PlanSnippet from './PlanSnippet'
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import Guitar from '../images/icon_guitar.svg'
import { PLAN_NAMES } from '../constants/planConstants'

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

const renderSelectField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input type="select" name="select" id="select_plan">
      {custom.options}
    </Input>
  </FormGroup>
)

class PurchasePlan extends Component {
  constructor(props) {
    super(props)
    this.state = {
      plan: 'personal',
      paying: false,
    }

    this.plans = {
      personal: {
        plan_desc: 'You have the additional ability to create games for up to 10 people with weekly updated playlists',
        plan_name: 'Personal Plan - $2/Month',
        plan_img: Guitar,
      },
    }
  }
  render() {
    let plan = this.plans[`${this.state.plan}`]
    const plansName = PLAN_NAMES
    return (
      <div>
        <Container>
          <Row center="xs">
            <Col xs={12}>
              <img src={Cup} width="70" />
              <h2 style={{ fontWeight: 'bold', margin: '1rem 0', color: '#fff' }}>PURCHASE PLAN</h2>
            </Col>
          </Row>
          <Row center="xs" style={{ background: '#fff', padding: '1rem' }}>
            <Col xs={12}>
              <div>
                <h3 className="font-light" style={{ marginTop: '2rem' }}>
                  Selected Plan
                </h3>
                <PlanSnippet backgroundDark plan={plan} />
              </div>
              <div>
                <h3 className="font-light">Payment info</h3>
                <form style={{ marginTop: '2rem' }}>
                  <Field
                    name="plan.type"
                    component={renderSelectField}
                    className="custom-form-field-black-w-label"
                    options={plansName ? plansName.map(p => <option key={p.value}> {p.plan_name} </option>) : ''}
                    label="SELECT PLAN"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="PAY WITH"
                    type="text"
                  />
                  <Row center="xs">
                    <Col xs={4} />
                    <Col xs={4} />
                    <Col xs={4} />
                    <Col xs={4} />
                  </Row>
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="NAME ON CARD"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="CARD NUMBER"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="EXPIRATION MONTH"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="text"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="CVV"
                    type="text"
                  />
                  <br />
                  <h3 className="font-light" style={{ marginBottom: '2rem' }}>
                    Billing Address
                  </h3>
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="BILLING ADDRESS"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="CITY"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="STATE"
                    type="text"
                  />
                  <Field
                    name=""
                    className="custom-form-field-black-w-label"
                    component={renderTextField}
                    label="ZIP CODE"
                    type="text"
                  />
                  <div
                    className="remember-me"
                    onClick={() => {
                      this.setState({ rememberMe: !this.state.rememberMe })
                    }}
                  >
                    <div>{this.state.rememberMe && <i className="fa fa-check" />} </div>
                    <label>SAVE BILLING INFORMATION</label>
                  </div>
                  <Button
                    className="mayhem-btn-yellow btn-full-width"
                    block
                    type="submit"
                    style={{ marginTop: '0.5rem' }}
                  >
                    {this.state.paying ? 'making payment...' : 'Purchase ' + this.state.plan + ' plan'}
                  </Button>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }
}
const mapDispatchToProps = dispatch => {
  return {
    logInUser: params => dispatch(logInUser(params)),
  }
}

const PurchaseForm = reduxForm({
  form: 'purchaseForm',
})(PurchasePlan)

export default connect(
  state => {
    return {
      auth: state.auth,
      initialValues: {
        account: { email: '', password: '' },
      },
    }
  },
  mapDispatchToProps
)(PurchaseForm)
