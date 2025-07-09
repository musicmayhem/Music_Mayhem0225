import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import Cup from '../images/icon_stopwatch.svg'
import { checkUserIsLogin } from '../actions/loginActions'
import { userDashboard } from '../actions/indexActions'
import PlanSnippet from './PlanSnippet'
import { connect } from 'react-redux'
import { PLAN_NAMES } from '../constants/planConstants'

class Plan extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPlan: 'freeplan',
    }
  }
  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.userDashboard()
    })
  }

  changePlan(planValue) {
    this.setState({ selectedPlan: planValue })
  }

  render() {
    return (
      <div>
        <Container>
          <Row center="xs">
            <Col xs={12}>
              <img src={Cup} width="70" />
              <h2 style={{ fontWeight: 'bold', margin: '1rem 0', color: '#fff' }}>SUBSCRIPTIONS</h2>
            </Col>
          </Row>
          <Row center="xs" style={{ background: '#fff', padding: '1rem 0' }}>
            <Col xs={12} style={{ padding: 0 }}>
              <div style={{ marginTop: 10 }}>
                <h3 className="font-light">Available Plans</h3>
                {PLAN_NAMES.map((plan, key) => {
                  return (
                    <div
                      key={key}
                      style={{
                        borderBottom: key + 1 === PLAN_NAMES.length ? '' : '1px solid #ddd',
                        padding: '1rem',
                        paddingBottom: '2rem',
                        paddingTop: '0',
                      }}
                    >
                      <PlanSnippet
                        onClick={() => this.changePlan(plan.value)}
                        backgroundDark={this.state.selectedPlan == plan.value ? true : false}
                        plan={plan}
                      />
                      {plan.value === this.state.selectedPlan ? (
                        <p className="purple-text" style={{ margin: 0 }}>
                          MY CURRENT PLAN
                        </p>
                      ) : (
                        <button className="mayhem-link" onClick={() => this.changePlan(plan.value)}>
                          Select plan
                        </button>
                      )}
                    </div>
                  )
                })}
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
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    userDashboard: () => dispatch(userDashboard()),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      index: state.index,
    }
  },
  mapDispatchToProps
)(Plan)
