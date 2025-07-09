import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import TicketIcon from '../images/tickets.svg'

export default class ListNormal extends Component {
  state = {
    animate: false,
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ animate: true })
    }, 1500)
  }

  render() {
    const { player1, player11, session } = this.props
    const songLeaders = this.props.songLeaders
    return (
      <div className={!this.state.animate ? 'animated-list-normal' : 'animated-list-normal animate-list-normal'}>
        <Row style={{ margin: '0rem 3rem' }}>
          <Col xs={12} style={{ borderBottom: '2px solid #fff' }}>
            <h1 className="font-light">Song Winners</h1>
          </Col>
          <Col xs={12}>
            {songLeaders &&
              songLeaders.sort(this.sortDesc).map((value, key) => {
                return (
                  <div key={key} className="songleader-list">
                    {player1 != null && session && key == 0 && (
                      <div xs={12}>
                        <span>{key + 1}</span>
                        <span>{player1.name}</span>
                        <span>{player1.current_song_score}</span>
                        <img
                          src={TicketIcon}
                          width="10px"
                          style={{ marginLeft: '7px', height: '35px', width: '35px' }}
                        />
                      </div>
                    )}
                    {key > 0 && session && (
                      <div xs={12}>
                        <span>{key + 1}</span>
                        <span>{value.name}</span>
                        <span>{value.current_song_score}</span>
                      </div>
                    )}
                    {player11 != null && session && key == 4 && (
                      <div xs={12}>
                        <span>{key + 7}</span>
                        <span>{player11.name}</span>
                        <span>{player11.current_song_score}</span>
                        <img src={TicketIcon} width="10px" style={{ height: '35px', width: '35px' }} />
                      </div>
                    )}
                    {!session && (
                      <div xs={12}>
                        <span>{key + 1}</span>
                        <span>{value.name}</span>
                        <span>{value.current_song_score}</span>
                      </div>
                    )}
                  </div>
                )
              })}
          </Col>
        </Row>
      </div>
    )
  }
}
