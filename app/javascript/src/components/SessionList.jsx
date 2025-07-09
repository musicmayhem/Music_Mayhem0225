import React from 'react'
import { makeRequest, postRequest } from '../actions/gameAction'
import { connect } from 'react-redux'
import { Row, Col } from 'react-flexbox-grid'
import {
  GET_OPEN_SESSION_LIST_SUCCESS,
  CLOSING_OPEN_SESSION_SUCCESS,
  CLOSING_OPEN_SERIES_SUCCESS,
} from '../constants/gameConstants'
import SeriesScore from './SeriesScore'
import { checkUserIsLogin } from '../actions/loginActions'

class SessionList extends React.Component {
  state = {
    accountRole: null,
  }

  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) {
        this.props.history.push('/')
      } else {
        this.props.makeRequest('games/get_open_session_list', { type: GET_OPEN_SESSION_LIST_SUCCESS })
        this.setState({ accountRole: res.account.role })
      }
    })
  }
  endOpenSessionRequest = id => {
    if (this.state.accountRole == 'host') {
      this.props.postRequest('games/close_open_session', {
        type: CLOSING_OPEN_SESSION_SUCCESS,
        values: { session_id: id },
      })
    }
  }
  endSeriesRequest = id => {
    if (this.state.accountRole == 'host') {
      this.props.postRequest('games/close_open_series', {
        type: CLOSING_OPEN_SERIES_SUCCESS,
        values: { series_id: id },
      })
    }
  }
  showSeriesScore = id => {
    window.location.assign(
      '/table/' + id,
    )
  }


  render() {
    const { accountRole } = this.state
    let data = this.props.game && this.props.game.sessionList && this.props.game.sessionList.map(x => [x.name, x.id])
    let seriesData =
      this.props.game && this.props.game.seriesList && this.props.game.seriesList.map(x => [x.name, x.id])
    return (
      <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center' }}>
        <div style={{ padding: '1rem', margin: '10vh 5vw', backgroundColor: 'white' }}>
          <h4 style={{ borderBottom: '1px solid #ddd' }}>LIST OF ACTIVE SERIES</h4>
          <Row>
            <Col xs={6}>
              <p style={{ color: '#210344' }}>Name</p>
            </Col>
            <Col xs={6}>
              <p style={{ color: '#210344' }}>Action</p>
            </Col>
          </Row>
          {seriesData &&
            seriesData.length > 0 &&
            seriesData.map((x, i) => (
              <span key={i}>
                <Row center="xs">
                  <Col xs={6} style={{ color: '#888' }}>
                    <p>{x[0]}</p>
                  </Col>
                  <Col xs={6} style={{ color: '#888' }}>
                    <a
                      style={{ pointerEvents: accountRole == 'host' ? '' : 'none' }}
                      className="mayhem-link-light"
                      onClick={() => this.showSeriesScore(x[1])}
                    >
                      Show
                    </a>
                  </Col>
                </Row>
              </span>
            ))}
        </div>
        <SeriesScore history={this.props.history} />
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
      game: state.game,
    }
  },
  mapDispatchToProps
)(SessionList)
