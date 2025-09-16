import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { checkUserIsLogin } from '../actions/loginActions'
import { makeRequest, postRequest } from '../actions/gameAction'
import { GET_SERIES_GAMES, SEND_USERS_EMAIL } from '../constants/gameConstants'
import Swal from 'sweetalert2'

class Main extends React.Component {
  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.makeRequest('games/get_series_games', { type: GET_SERIES_GAMES })
    })
  }

  showSeriesScore = x => {
    window.open(
      '/table/' + x.id,
      '_blank',
      'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=9999, height=9999'
    )
  }
  sendEmail = x => {
    this.props.postRequest('player/send_email_to_players', { type: SEND_USERS_EMAIL, values: { series: x.id } })
    Swal.fire({
      position: 'center',
      type: 'success',
      title: 'Mail Send Successfully',
      showConfirmButton: false,
      timer: 1500,
    })
  }

  render() {
    const { series_data } = this.props.game
    return (
      <div style={{ padding: '1rem', margin: '1vh 5vw', backgroundColor: 'white' }}>
        <Row center="xs" style={{ background: '#fff', padding: '1rem' }}>
          <Col xs={12}>
            <div style={{ fontWeight: 'bolder', textAlign: 'center' }}>
              <h3 className="font-light" style={{ padding: '1.5rem 0' }}>
                Series Games
              </h3>
              <Container
                style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '1.5rem 0.5rem' }}
              >
                <Row start={'xs'}>
                  <Col xs={6}>
                    <p style={{ color: '#210344' }}>Series Name</p>
                  </Col>
                  <Col xs={3}>
                    <p style={{ textAlign: 'center', color: '#210344' }}>Status</p>
                  </Col>
                  <Col xs={3} style={{ textAlign: 'center' }}>
                    <p style={{ color: '#210344' }}>Action</p>
                  </Col>
                </Row>
                {series_data &&
                  series_data.length != 0 &&
                  series_data.map((x, i) => (
                    <span key={i}>
                      <Row start="xs">
                        <Col xs={6} style={{ color: '#888' }}>
                          <p>{x.name}</p>
                        </Col>
                        <Col xs={3} style={{ textAlign: 'center', color: x.active ? 'green' : 'red' }}>
                          <p>{x.active ? 'ACTIVE' : 'INACTIVE'}</p>
                        </Col>
                        <Col xs={3} style={{ textAlign: 'center', color: '#888' }}>
                          <a className="mayhem-link-light" onClick={() => this.showSeriesScore(x)}>
                            View Scores
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
      game: state.game,
    }
  },
  mapDispatchToProps
)(Main)
