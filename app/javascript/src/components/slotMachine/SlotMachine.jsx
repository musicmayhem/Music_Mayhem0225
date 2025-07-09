/* global setTimeout */
import React from 'react'
import SlotNumbers from '../slotMachine/slotNumber'
import '../slotMachine/slotMachine.css'
import { connect } from 'react-redux'
import { REDEEM_TICKET, TICKETS } from '../../constants/accountConstants'
import { postRequest } from '../../actions/gameAction'

class SlotMachine extends React.Component {
  state = {
    showPlayerName: false,
    winner: '---',
    ticketNumber: [],
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch(
      postRequest('player/tickets', { type: TICKETS, values: { game: { code: this.props.match.params.game_code, spiff_value : this.props.spiffValue } } })
    )
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (np.account && np.account.lastTicket && this._runOnce) {
      this._runOnce = false
      this.getRandomTicketNumber(np.account.lastTicket)
    }
  }

  getRandomTicketNumber = number => {
    this._winner = number
    this.setState({ ticketNumber: this._winner.toString() })
    setTimeout(() => {
      this.props.dispatch(
        postRequest('player/redeem_ticket', {
          type: REDEEM_TICKET,
          values: { game: { code: this.props.match.params.game_code }, ticket: { winner: this._winner , spiff_value : this.props.spiffValue } },
        })
      )
    }, 20000)
  }

  _startCountDown = true
  _runOnce = true
  _winner = null

  render() {
    const { showPlayerName, ticketNumber } = this.state
    return (
      <div>
        <div className="winning-header">
          <div style={{ textAlign: 'left', justifyContent: 'left', fontSize: '4vh' }} className="timer">
            THE WINNING TICKET NUMBER IS:
            <b style={{ marginLeft: '1rem' }}>{this.state.gameCode}</b>
          </div>
          <div className="winning-page-logo" />
        </div>
        {!showPlayerName && ticketNumber && (
          <div className="machine">
            <div className="slots">
              <SlotNumbers
                {...this.props}
                number={ticketNumber}
                showPlayerName={(p, q) => this.setState({ showPlayerName: p, winner: q })}
              />
            </div>
          </div>
        )}
        {showPlayerName && ticketNumber && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fdca2b', fontSize: '3vw' }}>THE WINNER IS:</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="winning-page-number">{ticketNumber[0]}</div>
              <div className="winning-page-number">{ticketNumber[1]}</div>
              <div className="winning-page-number">{ticketNumber[2]}</div>
              <div className="winning-page-number">{ticketNumber[3]}</div>
            </div>
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

export default connect(mapStateToProps)(SlotMachine)
