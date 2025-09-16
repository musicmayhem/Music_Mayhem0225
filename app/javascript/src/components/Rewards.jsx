import React from 'react'
import PickIcon from '../images/picks.svg'
import TicketIcon from '../images/tickets.svg'
import ChatIcon from '../images/chat.svg'
import SpiffIcon from '../images/spiffs.svg'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import Swal from 'sweetalert2'
import { connect } from 'react-redux'
import { postRequest } from '../actions/gameAction'
import { REWARDS } from '../constants/accountConstants'

class Rewards extends React.Component {
  UNSAFE_componentWillMount() {
    if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
      this.props.dispatch(
        postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
      )
    }
  }

  spiff() {
    Swal.fire({
      position: 'top-end',
      type: 'success',
      title: 'Show Users Spiff',
      showConfirmButton: false,
    })
  }

  render() {
    const { tickets, picksCount, spiffsCount } = this.props.account
    const { playerScreen, leaderboard } = this.props
    return (
      <div>
        {!playerScreen && (
          <div style={{ background: '#241b44', padding: '2rem' }}>
            <Container>
              <Row center="xs">
                <Col xs={4}>
                  <img
                    onClick={() => this.props.pageState('ticket')}
                    style={{ position: 'relative', left: '1rem' }}
                    src={TicketIcon}
                    width="30"
                  />
                  <span className="notification-css">{tickets && tickets.length ? tickets.length : 0}T</span>
                </Col>
                {false && (
                  <div>
                    <Col xs={4}>
                      <img
                        // onClick={() => this.props.pageState('pick')}
                        onClick={() => false}
                        style={{ position: 'relative', left: '1rem' }}
                        src={PickIcon}
                        width="30"
                      />
                      <span className="notification-css">{picksCount}P</span>
                    </Col>
                    <Col xs={4}>
                      <img
                        onClick={() => this.spiff()}
                        style={{ position: 'relative', left: '1rem' }}
                        src={SpiffIcon}
                        width="60"
                      />
                      <span className="notification-css">{spiffsCount}</span>
                    </Col>
                  </div>
                )}
              </Row>
            </Container>
          </div>
        )}
        {playerScreen && (
          <div>
            <Container>
              <Row className="row end-xs" style={{ marginRight: '0rem', marginTop: '50px' }}>
                <Col style={{ margin: '1rem' }}>
                  <img
                    id="ticket"
                    onClick={() => this.props.pageState('ticket')}
                    style={{ position: 'relative', left: '1rem' }}
                    src={TicketIcon}
                    width="45"
                  />
                  <span className="player-notification-css">{tickets && tickets.length ? tickets.length : 0}</span>
                </Col>
                {!leaderboard && (
                  <Col style={{ margin: '1rem' }}>
                    <img
                      id="pick"
                      // onClick={() => this.props.pageState('pick')}
                      onClick={() => false}
                      style={{ position: 'relative', left: '1rem' }}
                      src={PickIcon}
                      width="45"
                    />
                    <span className="player-notification-css">{picksCount}</span>
                  </Col>
                )}
                {!leaderboard && (
                  <Col style={{ margin: '1rem' }}>
                    <img
                      id="spiff"
                      onClick={() => this.props.pageState('spiff')}
                      style={{ position: 'relative', left: '1rem' }}
                      src={SpiffIcon}
                      width="45"
                    />
                    <span className="player-notification-css">{spiffsCount}</span>
                  </Col>
                )}
                {!leaderboard && (
                  <Col style={{ margin: '1rem' }}>
                    <img
                      id="chat"
                      onClick={() => this.props.getChatModal()}
                      style={{ position: 'relative', left: '1rem' }}
                      src={ChatIcon}
                      width="45"
                    />
                    {/* <span className="player-notification-css">{spiffsCount}</span> */}
                  </Col>
                )}
              </Row>
            </Container>
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps(store) {
  return {
    account: store.account,
  }
}
export default connect(mapStateToProps)(Rewards)
