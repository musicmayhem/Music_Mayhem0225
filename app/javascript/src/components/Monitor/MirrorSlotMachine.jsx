/* global setTimeout */
import React from 'react'
import MirrorSlotNumber from './MirrorSlotNumber'
import '../slotMachine/slotMachine.css'

class MirrorSlotMachine extends React.Component {
  state = {
    ticketNumber: this.props.number,
    showWinner: false,
  }

  UNSAFE_componentWillMount() {
    if (this.props.number.toString() != [1, 0, 0]) {
      setTimeout(() => {
        this.setState({ showWinner: true })
      }, 20000)
    }
  }
  render() {
    const { ticketNumber, showWinner } = this.state
    return (
      <div>
        <div className="winning-header">
          <div style={{ textAlign: 'left', justifyContent: 'left', fontSize: '4vh' }} className="timer">
            THE WINNING TICKET NUMBER IS:
            <b style={{ marginLeft: '1rem' }}>{}</b>
          </div>
          <div className="winning-page-logo" />
        </div>
        {!showWinner && (
          <div className="machine">
            <div className="slots">
              <MirrorSlotNumber
                {...this.props}
                number={ticketNumber}
                showPlayerName={(p, q) => this.setState({ showPlayerName: p, winner: q })}
              />
            </div>
          </div>
        )}
        {showWinner && (
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

export default MirrorSlotMachine
