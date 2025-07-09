import React, { Component } from 'react'

class PlanSnippet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      background: props.backgroundDark ? '#321b47' : 'white',
    }
  }
  UNSAFE_componentWillReceiveProps(np) {
    this.setState({ background: np.backgroundDark ? '#321b47' : 'white' })
  }
  render() {
    let plan = this.props.plan
    return (
      <div
        style={{ border: '1px solid #aaa', background: this.state.background, margin: '2rem 1rem', padding: '1rem' }}
      >
        <div>
          <img
            src={plan.plan_img}
            alt="Users Profile"
            width="70px"
            height="70px"
            style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}
          />
        </div>
        <h5
          style={{
            color: this.state.background == 'white' ? '#210344' : '#ffca27',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            marginBottom: 5,
            fontSize: '1rem',
          }}
        >
          {plan.plan_name}
        </h5>
        <p style={{ color: this.state.background == 'white' ? '#4b4f63' : '#fff' }}>{plan.plan_desc}</p>
      </div>
    )
  }
}

export default PlanSnippet
