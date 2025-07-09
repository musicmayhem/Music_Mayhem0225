import React, { Component } from 'react'
import Countdown from 'react-countdown'

class CountDownTimer extends Component {

  render(){
    return(
      <Countdown
        date={parseInt(this.props.songDuration)}
        renderer={({ minutes, seconds, completed }) => {
          if (completed) {
            return <span style={{ justifyContent: 'center', display: 'flex', fontWeight: 'bold'}}>Song completed</span>;
          } else {
            return <span style={{ justifyContent: 'center', display: 'flex', fontWeight: 'bold'}}>Song Remaining: {' '}{("0" + minutes).slice(-2)}:{("0" + seconds).slice(-2)}</span>;
          }
        }}
      />
    )
  }
}


export default CountDownTimer
