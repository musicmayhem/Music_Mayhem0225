import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'

export default class SessionLeaderboard extends Component {
  state = {
    animate: false,
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ animate: true })
    }, 1200)
  }
  render() {
    const gameLeaders = this.props.gameLeaders
    return (
      <div className={!this.state.animate ? 'animated-list-colored' : 'animated-list-colored animate-list-colored'}>
        <Row style={{ margin: '0rem 3rem' }}>
          <Col xs={12} style={{ borderBottom: '2px solid #fff' }}>
            <h1 className="font-light">
              Session Leaderboard
              <div style={{ display: 'inline-block', float: 'right' }}>
                <i className="fa fa-trophy" style={{ color: '#c2af8b', fontSize: '1.3rem', margin: '0 0.2rem' }} />
                <i className="fa fa-trophy" style={{ color: '#dcdcdc', fontSize: '1.7rem', margin: '0 0.2rem' }} />
                <i className="fa fa-trophy" style={{ color: '#ffca27' }} />
              </div>
            </h1>
          </Col>
          <Col xs={12} className="leaderboard-list">
            {gameLeaders &&
              Object.entries(gameLeaders).map((value, key) => {
                return (
                  <div xs={12} key={key}>
                    <span>{key + 1}</span>
                    <span>{value[1][0]}</span>
                    <span>{value[1][1]}</span>
                  </div>
                )
              })}
          </Col>
        </Row>
      </div>
    )
  }
}
