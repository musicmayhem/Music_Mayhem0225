import React, { Component } from 'react'
import CircularProgressbar from 'react-circular-progressbar'
import { connect } from 'react-redux'
import { startingRoundServer } from '../actions/hostGameActions'

class Timer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      time: props.time || 1.5,
      data: props.data || 'Your game starts in:',
      minutes: props.minutes || true,
      timeText: '',
      timeInSeconds: 0,
      timeInString: '',
      percentage: 0,
    }
  }

  UNSAFE_componentWillMount() {
    if (this.props.demo && this.props.game && this.props.game.rounds) {
      setTimeout(() => {
        this.props.startingRoundServer({ round: this.props.game.rounds })
        this.props.beginGame(true)
      }, this.props.time * 70000)
    }
  }

  componentDidMount() {
    this.initialTimeInSeconds = this.state.minutes ? this.state.time * 60 : this.state.time
    this.setState({
      timeInSeconds: this.initialTimeInSeconds,
      timeInString: this.state.minutes
        ? String(Math.floor(this.initialTimeInSeconds / 60)) + ':' + String((this.initialTimeInSeconds % 60).toFixed(0))
        : String(this.initialTimeInSeconds),
    })

    setTimeout(() => {
      this.timer = setInterval(() => {
        if (this.state.timeInSeconds >= 0) {
          if (this.state.minutes) {
            this.setState({
              percentage: 100 - (this.state.timeInSeconds / this.initialTimeInSeconds) * 100,
              timeInSeconds: this.state.timeInSeconds - 1,
              timeInString:
                String(Math.floor(this.state.timeInSeconds / 60)) +
                ':' +
                (this.state.timeInSeconds % 60 > 9
                  ? String((this.state.timeInSeconds % 60).toFixed(0))
                  : '0' + String((this.state.timeInSeconds % 60).toFixed(0))),
            })
          } else {
            this.setState({
              percentage: 100 - (this.state.timeInSeconds / this.initialTimeInSeconds) * 100,
              timeInSeconds: this.state.timeInSeconds - 1,
              timeInString: String(this.state.timeInSeconds.toFixed(0)),
            })
          }
        }
      }, 1000)
    }, 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  initialTimeInSeconds = 0

  render() {
    return (
      <div>
        {this.props.position == 'top' && (
          <div>
            <div className="yellow-header">
              <div style={{ width: '100%' }}>
                <i className="fa fa-clock-o" /> {this.state.data} {this.state.timeInString}{' '}
              </div>
            </div>
          </div>
        )}
        {!(this.props.position == 'top') && (
          <div>
            <div className="round-timer">
              <div style={{ transform: 'scale(1.7)' }}>
                <h1
                  style={{
                    color: '#210344',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '1.3rem',
                    marginBottom: '1rem',
                  }}
                >
                  {this.state.data}
                </h1>
                <div>
                  <CircularProgressbar percentage={this.state.percentage} text={this.state.timeInString} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    startingRoundServer: params => dispatch(startingRoundServer(params)),
  }
}

export default connect(
  null,
  mapDispatchToProps
)(Timer)
