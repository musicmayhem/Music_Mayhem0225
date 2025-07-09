/*global setTimeout document*/
import React from 'react'
import { WINNER_TICKET } from '../../constants/accountConstants'
import { postRequest } from '../../actions/gameAction'
import { connect } from 'react-redux'

class SlotNumber extends React.Component {
  state = {
    slotNumberOne: '',
    slotNumberTwo: '',
    slotNumberThree: '',
    slotNumberFour: '',
  }

  componentDidMount() {
    this._runOnce = true
    setTimeout(() => {
      this.setState({ slotNumberOne: 'active-number' })
    }, 5000)
    setTimeout(() => {
      this.setState({ slotNumberTwo: 'active-number' })
    }, 10000)
    setTimeout(() => {
      this.setState({ slotNumberThree: 'active-number' })
    }, 15000)
    setTimeout(() => {
      this.setState({ slotNumberFour: 'active-number' })
    }, 20000)
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (this._runOnce) {
      this._runOnce = false
      this.props.dispatch(
        postRequest('/player/winner_ticket', {
          type: WINNER_TICKET,
          values: { game: { code: this.props.match.params.game_code }, ticket: np.number },
        })
      )
    }
    if (np.account.winner && np.account.winner.username && this._getWinner) {
      this._getWinner = false
      setTimeout(() => {
        this.props.showPlayerName(true, np.account.winner.username)
        document.querySelectorAll('.number').forEach(num => {
          num.style.opacity = 0
        })
      }, 25000)
    }
  }

  _getWinner = true
  _runOnce = true

  render() {
    const { number } = this.props
    const { slotNumberThree, slotNumberTwo, slotNumberOne, slotNumberFour } = this.state
    return (
      <div>
        <ul className="slot">
          <li className="number">0</li>
          <li className="number">1</li>
          <li className="number">2</li>
          <li className="number">3</li>
          <li className={`number ${slotNumberOne}`}>{number[0]}</li>
          <li className="number">5</li>
          <li className="number">6</li>
          <li className="number">7</li>
          <li className="number">8</li>
          <li className="number">9</li>
        </ul>
        <ul className="slot">
          <li className="number">0</li>
          <li className="number">1</li>
          <li className="number">2</li>
          <li className="number">3</li>
          <li className="number">4</li>
          <li className="number">5</li>
          <li className="number">6</li>
          <li className="number">7</li>
          <li className={`number ${slotNumberTwo}`}>{number[1]}</li>
          <li className="number">9</li>
        </ul>
        <ul className="slot">
          <li className="number">0</li>
          <li className="number">1</li>
          <li className="number">2</li>
          <li className="number">3</li>
          <li className="number">4</li>
          <li className="number">5</li>
          <li className="number">6</li>
          <li className="number">7</li>
          <li className={`number ${slotNumberThree}`}>{number[2]}</li>
          <li className="number">9</li>
        </ul>
        <ul className="slot">
          <li className="number">0</li>
          <li className="number">1</li>
          <li className="number">2</li>
          <li className="number">3</li>
          <li className="number">4</li>
          <li className="number">5</li>
          <li className="number">6</li>
          <li className="number">7</li>
          <li className={`number ${slotNumberFour}`}>{number[3]}</li>
          <li className="number">9</li>
        </ul>
      </div>
    )
  }
}
function mapStateToProps(store) {
  return {
    account: store.account,
  }
}

export default connect(mapStateToProps)(SlotNumber)
