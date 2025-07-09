import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import Cup from '../images/icon_stopwatch.svg'
import { checkUserIsLogin } from '../actions/loginActions'
import Loader from './Loader'
import { makeRequest } from '../actions/gameAction'
import { GAME_HISTORY } from '../constants/indexConstants'

class Main extends React.Component {
  constructor(props) {
    super(props)
  }
  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.makeRequest('games/game_history', { type: GAME_HISTORY })
    })
  }
  render() {
    const { played_games } = this.props.index
    return (
      <Container>
        {!this.props.index.getting_data && <Loader />}
        {this.props.index.getting_data && (
          <div>
            <Row center="xs">
              <Col xs={12}>
                <img src={Cup} width="70" />
                <h2 style={{ fontWeight: 'bold', margin: '1rem 0', color: '#fff' }}>GAME HISTORY</h2>
              </Col>
            </Row>
            <Row center="xs" style={{ background: '#fff', padding: '1rem' }}>
              <Col xs={12}>
                <div>
                  <h3 className="font-light" style={{ padding: '1.5rem 0' }}>
                    Completed Games
                  </h3>
                  <Container
                    style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '1.5rem 0.5rem' }}
                  >
                    <Row>
                      <Col xs={6} style={{ textAlign: 'left' }}>
                        <p style={{ color: '#210344' }}>Game</p>
                      </Col>
                      <Col xs={3} style={{ textAlign: 'right' }}>
                        <p style={{ color: '#210344' }}>Date</p>
                      </Col>
                      <Col xs={3} style={{ textAlign: 'right' }}>
                        <p style={{ color: '#210344' }}>Score</p>
                      </Col>
                    </Row>
                    {played_games &&
                      played_games.length != 0 &&
                      played_games.map((x, i) => (
                        <span key={i}>
                          <Row center="xs">
                            <Col xs={6} style={{ textAlign: 'left', color: '#888' }}>
                              <p>{x.game}</p>
                            </Col>
                            <Col xs={3} style={{ textAlign: 'right', color: '#888' }}>
                              <p>{x.updated_at}</p>
                            </Col>
                            <Col xs={3} style={{ textAlign: 'right', color: '#888' }}>
                              <p>{x.score}</p>
                            </Col>
                          </Row>
                        </span>
                      ))}
                  </Container>
                  <br />
                  <a href="" className="mayhem-link">
                    LOAD MORE HISTORY
                  </a>
                  <br />
                  <br />
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
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
)(Main)
