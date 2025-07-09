/*global document ga setTimeout localStorage*/
import React from 'react'
import { connect } from 'react-redux'
import { updateGameRequest } from '../actions/hostGameActions'

class Advertisement extends React.Component {
  UNSAFE_componentWillMount() {
    ga('send', {
      hitType: 'event',
      eventCategory: 'Slides',
      eventAction: 'play',
      eventLabel: this.props.assetsUrl[0][localStorage['indexImg']],
    })

    if (!this.props.startPage && !this.props.flashppt && !this.props.mirror ) {
      setTimeout(() => {
        this.props.updateGameRequest({ state: 'Showing LeaderBoard', code: this.props.gameCode })
      }, 11000)
    }
  }

  render() {
    let data = this.props.startPage ? this.props.assetsUrl[0] : this.props.assetsUrl[1]
    const randomAsset = localStorage['indexImg']
      ? localStorage['indexImg'] < data.length - 1
        ? (localStorage['indexImg'] = parseInt(localStorage['indexImg']) + 1)
        : (localStorage['indexImg'] = 0)
      : (localStorage['indexImg'] = 1)
    const assetsUrl = data.length == 1 ? data : data[randomAsset]
    const { game_code_display , gameCode } = this.props
    return (
      <div>
        {!this.props.startPage && (
          <div className="yellow-header" style={{ marginBottom: 0 }}>
            <div className="timer">
            GOMAYHEM.COM {game_code_display && <b>{'code: '+gameCode}</b>}
            </div>
            <div />
          </div>
        )}
        <div className="iframeWrapper">
          <div className="full-screen-image" style={{ width: '100vw', height: '90vh' }}>
            <iframe
              src={assetsUrl}
              allowFullScreen
              className="advertise-img"
              frameBorder="0"
              height="839"
              mozallowfullscreen="true"
              webkitallowfullscreen="true"
              width="1440"
              scrolling="no"
            />
            <div className="overlay" />
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateGameRequest: params => dispatch(updateGameRequest(params)),
  }
}

export default connect(
  null,
  mapDispatchToProps
)(Advertisement)
