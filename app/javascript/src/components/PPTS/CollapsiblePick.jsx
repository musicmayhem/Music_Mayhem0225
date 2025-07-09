import React from 'react'
import { Collapse, Row } from 'reactstrap'

class CollapsibePick extends React.Component {
  constructor(props) {
    super(props)

    this.toggle = this.toggle.bind(this)
    this.state = { collapse: false }
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse })
  }

  render() {
    const { data, p, picksCount } = this.props
    return (
      <div>
        <Row style={{ margin: '1rem 0.2rem', flexDirection: 'column' }}>
          <span id="coins-badge" className="fa-stack fa-5x has-badge" data-count={p[2]} onClick={this.toggle} />
          <h6
            style={{
              color: 'white',
              fontWeight: '700',
              marginBottom: '0.5rem',
              marginLeft: '3rem',
              textTransform: 'uppercase',
            }}
            onClick={this.toggle}
          >
            {' '}
            {p[0]}{' '}
          </h6>
          <div>
            <Collapse style={{ color: '#ffca27' }} isOpen={this.state.collapse}>
              {data}
              <br />
              {picksCount >= p[2] && p[0] !== 'Mute Player' ? (
                <button
                  onClick={() => this.props.redeemR(p[0])}
                  style={{
                    background: 'cornflowerblue',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: '600',
                    border: 'none',
                    padding: '.5em',
                    marginTop: '.5rem',
                  }}
                >
                  USE {p[2]} {p[2] == 1 ? 'PICK' : 'PICKS'}
                </button>
              ) : p[0] !== 'Mute Player' ? (
                <a style={{ color: 'grey', textDecoration: 'none', fontWeight: '600' }}>NOT ENOUGH PICKS YET</a>
              ) : (
                ''
              )}
              {picksCount >= p[2] && p[0] == 'Mute Player' ? (
                <button
                  onClick={() => this.props.redeemR2(p[0])}
                  style={{
                    background: 'cornflowerblue',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: '600',
                    border: 'none',
                    padding: '.5em',
                  }}
                >
                  USE {p[2]} {p[2] == 1 ? 'PICK' : 'PICKS'}
                </button>
              ) : p[0] == 'Mute Player' && picksCount == 0 ? (
                <a style={{ color: 'grey', textDecoration: 'none', fontWeight: '600' }}>NOT ENOUGH PICKS YET</a>
              ) : p[0] == 'Mute Player' ? (
                <a style={{ color: 'grey', textDecoration: 'none', fontWeight: '600' }}>NOT ENOUGH PICKS YET</a>
              ) : (
                ''
              )}
              <br />
            </Collapse>
          </div>
          <br />
        </Row>
      </div>
    )
  }
}

export default CollapsibePick
