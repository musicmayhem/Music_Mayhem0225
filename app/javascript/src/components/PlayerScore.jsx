import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { checkUserIsLogin } from '../actions/loginActions'
import { makeRequest, postRequest } from '../actions/gameAction'
import { PLAYER_SCORE } from '../constants/playerConstants'

class Main extends React.Component {
  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.makeRequest('player/series_score', { type: PLAYER_SCORE })
    })
  }

  showSeriesScore = x => {
    window.location = '/table/' + x.id
  }

  render() {
    const { series_data } = this.props.player
    return (
      <div style={{ padding: '1rem', margin: '1vh 5vw', backgroundColor: 'white' }}>
        <Row center="xs" style={{ background: '#fff', padding: '1rem' }}>
          <Col xs={12}>
            <div style={{ fontWeight: 'bolder', textAlign: 'center' }}>
              <h3 className="font-light" style={{ padding: '1.5rem 0' }}>
                My League Games
              </h3>
              <Container
                style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '1.5rem 0.5rem' }}
              >
                <Row start={'xs'}>
                  <Col xs={8}>
                    <p style={{ color: '#210344' }}>Series Name</p>
                  </Col>
                  <Col xs={4} style={{ textAlign: 'center' }}>
                    <p style={{ color: '#210344' }}>Action</p>
                  </Col>
                </Row>
                {series_data &&
                  series_data.length != 0 &&
                  series_data.map((x, i) => (
                    <span key={i}>
                      <Row start="xs">
                        <Col xs={8} style={{ color: '#888' }}>
                          <p>{x.name}</p>
                        </Col>
                        <Col xs={4} style={{ textAlign: 'center', color: '#888' }}>
                          <a className="mayhem-link-light" onClick={() => this.showSeriesScore(x)}>
                            View
                          </a>
                        </Col>
                      </Row>
                    </span>
                  ))}
              </Container>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      player: state.player,
    }
  },
  mapDispatchToProps
)(Main)
