import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import TicketIcon from '../../images/tickets.svg'
import { postRequest } from '../../actions/gameAction'
import { connect } from 'react-redux'
import { REWARDS } from '../../constants/accountConstants'
import Modal from 'react-responsive-modal'

class Tickets extends React.Component {
  UNSAFE_componentWillMount() {
    if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
      this.props.dispatch(
        postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
      )
    }
  }

  redeemTicket = winner => {
    if (this.props.match && this.props.match.params && this.props.match.params.game_code) {
      this.props.dispatch(
        postRequest('player/redeem_ticket', {
          type: REWARDS,
          values: { game: { code: this.props.match.params.game_code }, number: winner, spiff_value: this.props.spiffValue },
        })
      )
    } else {
      this.props.dispatch(
        postRequest('player/redeem_ticket', {
          type: REWARDS,
          values: { game: { code: this.props.game.code }, number: winner, spiff_value: this.props.spiffValue },
        })
      )
    }
  }

  render() {
    const { tickets } = this.props.account
    let str = 'MY \n' + 'MAYHEM \n' + 'TICKETS \n'
    return (
      <Container>
        <Row center="xs" style={{ padding: '0px' }}>
          <Col xs={12} style={{ padding: 0, background: 'none', width: '335px' }}>
            <Modal open={true} onClose={() => this.props.pageState('')} center>
              <pre className="ppts-heading">
                <div>
                  <span
                    id="notice-badge-model"
                    className="fa-stack fa-5x has-badge"
                    data-count={tickets && tickets.length ? tickets.length : 0}
                  >
                    <img src={TicketIcon} width="40px" style={{ height: '80px', width: '80px', margin: '24% 8%' }} />
                  </span>
                </div>
                <div style={{ textAlign: 'left', lineHeight: '1', marginLeft: '-12px', marginTop: '31px' }}>{str}</div>
              </pre>
              <div
                style={{
                  marginTop: '3rem',
                  background: '#231844',
                  paddingTop: '1rem',
                  paddingLeft: '18px',
                  paddingRight: '18px',
                  paddingBottom: '25px',
                  overflowY: 'auto',
                  height: '24rem',
                }}
              >
                <Container style={{ textAlign: 'left' }}>
                  <div style={{ color: 'lightblue', margin: '10px 0' }}>
                    Tickets help you win prizes during the game. Check back here during raffles to see if you won!
                  </div>
                  {tickets &&
                    tickets.length != 0 &&
                    tickets.map((x, i) => (
                      <span key={i}>
                        <Row style={{ margin: '0 0.2rem', flexDirection: 'column' }}>
                          <div style={{ color: 'white', marginBottom: '-0.7rem', fontSize: '14px', display: 'flex' }}>
                            {x.number}
                            <h6 style={{ color: '#ffca27', fontWeight: '600', lineHeight: '0', margin: '10px' }}>
                              {' '}
                              {x.winner ? '-Winner' : ''}
                            </h6>
                            {x.winner && (
                              <a
                                onClick={() => (x.redeemed ? '' : this.redeemTicket(x.id))}
                                style={{
                                  color: 'rgba(30, 178, 228,1.00)',
                                  textDecoration: 'none',
                                  fontWeight: '600',
                                  position: 'relative',
                                  right: '-3vw',
                                }}
                              >
                                {x.redeemed ? <span style={{ color: 'grey' }}>Claimed</span> : 'CLAIM'}
                              </a>
                            )}
                          </div>
                        </Row>
                        <br />
                      </span>
                    ))}
                </Container>
              </div>
            </Modal>
          </Col>
        </Row>
      </Container>
    )
  }
}

function mapStateToProps(store) {
  return {
    account: store.account,
  }
}
export default connect(mapStateToProps)(Tickets)
