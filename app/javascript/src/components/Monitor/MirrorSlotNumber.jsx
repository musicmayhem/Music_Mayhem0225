/*global setTimeout document*/
import React from 'react'

class MirrorSlotNumber extends React.Component {
  state = {
    slotNumberOne: '',
    slotNumberTwo: '',
    slotNumberThree: '',
    slotNumberFour: '',
  }

  componentDidMount() {
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

export default MirrorSlotNumber
