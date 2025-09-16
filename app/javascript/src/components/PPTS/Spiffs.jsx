import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import SpiffIcon from '../../images/spiffs.svg'
import Modal from 'react-responsive-modal'
import Swal from 'sweetalert2'
import { REWARDS, REDEEM_SPIFF, REDEEM_INDEX_SPIFF } from '../../constants/accountConstants'
import { postRequest } from '../../actions/gameAction'

class Spiffs extends React.Component {
  state = {
    spiffRedeemed: false,
  }
  UNSAFE_componentWillMount() {
    if (this.props.game && this.props.game.game && this.props.game.game.session_id && !this.props.indexPage) {
      this.props.dispatch(
        postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
      )
    }
    if (this.props.indexPage) {
      this.props.dispatch(
        postRequest('player/rewards', { type: REWARDS, values: { session_id: null } })
      )
    }
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (np.indexPage && np.account && np.account.spiffRedeemed)
      this.setState({ spiffRedeemed: np.account && np.account.spiffRedeemed })
  }

  redeemSpiff(spiffId, acc) {
    Swal.fire({
      position: 'center',
      type: 'question',
      title: 'Ready to claim your prize?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
      cancelButtonText: 'Not yet',
    }).then(result => {
      if (result.value) {
        if (this.props.match && this.props.match.params && this.props.match.params.game_code) {
          this.props.dispatch(
            postRequest('player/redeem_spiff', {
              type: REDEEM_SPIFF,
              values: { game: { code: this.props.match.params.game_code }, spiff_id: spiffId, player_account: acc },
            })
          )
        } else {
          this.props.dispatch(
            postRequest('player/redeem_spiff', {
              type: REDEEM_SPIFF,
              values: { game: { code: this.props.game.code }, spiff_id: spiffId, player_account: acc },
            })
          )
        }
        if (this.props.indexPage) {
          this.props.dispatch(
            postRequest('games/redeem_index_spiff', {
              type: REDEEM_INDEX_SPIFF,
              values: { spiff_id: spiffId, player_account: acc },
            })
          )
        }
        Swal.fire({
          type: 'success',
          title: 'Your Spiff Redeemed Successfully!',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    })
  }

  render() {
    const { spiffs, spiffsCount } = this.props.account
    const { spiffRedeemed } = this.state
    let str = 'MY \n' + 'MAYHEM \n' + 'SPIFFS \n'
    return (
      <Container>
        <Row center="xs" style={{ padding: '0px' }}>
          <Col xs={12} style={{ padding: 0, background: 'none', width: '335px' }}>
            {!this.props.indexPage && (
              <Modal open={true} onClose={() => this.props.pageState('')} center>
                <pre
                  style={{
                    color: '#ffca27',
                    fontWeight: 'bold',
                    fontSize: '30px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'left',
                    marginBottom: '-2rem',
                    background: '#231844',
                  }}
                >
                  <div>
                    <span id="notice-badge-model" className="fa-stack fa-5x has-badge" data-count={spiffsCount}>
                      <img src={SpiffIcon} width="40px" style={{ height: '80px', width: '80px', margin: '24% 8%' }} />
                    </span>
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: '1', marginLeft: '-12px', marginTop: '31px' }}>
                    {str}
                  </div>
                </pre>
                <div
                  style={{
                    marginTop: '1rem',
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
                  <div style={{color: 'lightblue', margin: '10px 0'}}>Spiffs are digital awards you can redeem for real-world prizes</div>
                    {spiffs &&
                      spiffs.map((p, i) => (
                        <Row key={i} style={{ margin: '0 0.2rem', flexDirection: 'column' }}>
                          {p.redeemed_at == null ? (
                            <div>
                              {' '}
                              <h6
                                style={{
                                  color: 'white',
                                  fontWeight: '700',
                                }}
                              >
                                {' '}
                                {p.name}
                              </h6>
                              <br />
                              <h6
                                style={{
                                  color: '#ffca27',
                                  fontWeight: '600',
                                  lineHeight: '0.2',
                                  textTransform: 'uppercase',
                                  fontSize: '13px',
                                }}
                              >
                                <i style={{ position: 'relative', top: '-1rem' }}>
                                  Awarded_at :{' '}
                                  <a
                                    onClick={() => this.redeemSpiff(p.id, p.account_id)}
                                    style={{
                                      color: 'rgba(30, 178, 228,1.00)',
                                      textDecoration: 'none',
                                      fontWeight: '600',
                                      position: 'relative',
                                      left: '3rem',
                                    }}
                                  >
                                    Redeem
                                  </a>
                                </i>{' '}
                                <br />({p.awarded_at})
                              </h6>
                              <br />
                            </div>
                          ) : (
                            <div>
                              {' '}
                              <h6
                                style={{
                                  color: 'grey',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {' '}
                                {p.name}
                              </h6>
                              <br />
                              <h6
                                style={{
                                  color: 'grey',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  fontSize: '13px',
                                }}
                              >
                                <i style={{ position: 'relative', top: '-1rem' }}>
                                  Redeemed_at :{' '}
                                  <a
                                    style={{
                                      color: 'grey',
                                      textDecoration: 'none',
                                      fontWeight: '600',
                                      position: 'relative',
                                      left: '3rem',
                                    }}
                                  >
                                    Redeemed
                                  </a>
                                </i>{' '}
                                <br />({p.redeemed_at})
                              </h6>
                              <br />
                            </div>
                          )}
                        </Row>
                      ))}
                  </Container>
                </div>
              </Modal>
            )}
            {this.props.indexPage && spiffs && spiffs.length > 0 && (
              <div
                style={{
                  marginTop: '1rem',
                  background: '#231844',
                  paddingTop: '2rem',
                  paddingLeft: '18px',
                  paddingRight: '18px',
                  paddingBottom: '25px',
                }}
              >
                <Container style={{ textAlign: 'left' }}>
                  {spiffs &&
                    spiffs.map((p, i) => (
                      <Row key={i} style={{ margin: '0 0.2rem', flexDirection: 'column' }}>
                        {p.redeemed_at == null ? (
                          <div>
                            {' '}
                            <h6
                              style={{
                                color: 'white',
                                fontWeight: '700',
                                lineHeight: '0.2',
                                textTransform: 'uppercase',
                              }}
                            >
                              {' '}
                              {p.name}
                            </h6>
                            <br />
                            <h6
                              style={{
                                color: '#ffca27',
                                fontWeight: '600',
                                lineHeight: '0.2',
                                textTransform: 'uppercase',
                                fontSize: '13px',
                              }}
                            >
                              <i style={{ position: 'relative', top: '-1rem' }}>
                                Awarded_at :{' '}
                                <a
                                  onClick={() => this.redeemSpiff(p.id, p.account_id)}
                                  style={{
                                    color: 'rgba(30, 178, 228,1.00)',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    position: 'relative',
                                    float: 'right',
                                  }}
                                >
                                  Redeem
                                </a>
                              </i>{' '}
                              <br />({p.awarded_at})
                            </h6>
                            <br />
                          </div>
                        ) : (
                          <div>
                            {' '}
                            <h6
                              style={{
                                color: 'grey',
                                fontWeight: '700',
                                lineHeight: '0.2',
                                textTransform: 'uppercase',
                              }}
                            >
                              {' '}
                              {p.name}
                            </h6>
                            <br />
                            <h6
                              style={{
                                color: 'grey',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                fontSize: '13px',
                              }}
                            >
                              <i style={{ position: 'relative', top: '-1rem' }}>
                                Redeemed_at :{' '}
                                <a
                                  style={{
                                    color: 'grey',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    position: 'relative',
                                    float: 'right',
                                  }}
                                >
                                  Redeemed
                                </a>
                              </i>{' '}
                              <br />({p.redeemed_at})
                            </h6>
                            <br />
                          </div>
                        )}
                      </Row>
                    ))}
                </Container>
              </div>
            )}
            {this.props.indexPage && spiffs && spiffs.length == 0 && (
              <div
                style={{
                  padding: '1rem',
                  background: '#231844',
                  color: '#ffca27',
                }}
              >
                No Spiffs
              </div>
            )}
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
export default connect(mapStateToProps)(Spiffs)
