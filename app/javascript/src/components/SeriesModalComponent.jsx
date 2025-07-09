/* global document */
import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { postRequest } from '../actions/gameAction'
import { CLOSING_SERIES_SESSION_SUCCESS, CLOSING_OPEN_SERIES_SUCCESS } from '../constants/gameConstants'

class SeriesModalComponent extends React.Component {
  endSeriesRequest = series => {
    this.props.postRequest('games/close_open_series', {
      type: CLOSING_OPEN_SERIES_SUCCESS,
      values: { series_id: series.id },
    })
    document.getElementsByClassName('styles_closeButton__20ID4')[1].click()
  }
  endOpenSessionRequest = session => {
    this.props.postRequest('games/close_open_session', {
      type: CLOSING_SERIES_SESSION_SUCCESS,
      values: { session_id: session.id },
    })
  }

  render() {
    let data = this.props.game.seriesSessions
    return (
      <div>
        <h5>ACTIVE SERIES: </h5>
        {this.props.game.seriesData && this.props.game.seriesData.active && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <p style={{ color: '#210344' }}>{this.props.game.seriesData.name}</p>
            <a
              className="mayhem-link-light"
              style={{ marginBottom: '2rem' }}
              onClick={() => this.endSeriesRequest(this.props.game.seriesData)}
            >
              end
            </a>
          </div>
        )}
        <h5>ACTIVE SESSIONS: </h5>
        {data &&
          data.length > 0 &&
          data.map((x, i) => (
            <span key={i}>
              {x.active && (
                <Row center="xs">
                  <Col xs={6} style={{ textAlign: 'right', color: '#888' }}>
                    <p>{x.name}</p>
                  </Col>
                  <Col xs={6} style={{ textAlign: 'right', color: '#888' }}>
                    <a className="mayhem-link-light" onClick={() => this.endOpenSessionRequest(x)}>
                      end
                    </a>
                  </Col>
                </Row>
              )}
            </span>
          ))}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
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
)(SeriesModalComponent)
