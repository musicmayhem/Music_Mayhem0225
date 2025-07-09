import React, { Component } from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'

class CompletedGames extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let played_games = this.props.played_games

    return (
      <div style={{ background: '#fff', padding: '1rem 1rem' }}>
        <h3 className="font-light">Completed Games</h3>
        <Container style={{ marginTop: '1rem', borderBottom: '1px solid #ddd', borderTop: '1px solid #ddd' }}>
          {played_games &&
            played_games.length != 0 &&
            played_games
              .slice(-5)
              .reverse()
              .map((x, i) => (
                <span key={i}>
                  <Row center="xs">
                    <Col xs={6} style={{ textAlign: 'left', color: '#888' }}>
                      <p>{x.game}</p>
                    </Col>
                    <Col xs={3} style={{ textAlign: 'right', color: '#888' }}>
                      <p>{x.updated_at}</p>
                    </Col>
                    <Col xs={3} style={{ textAlign: 'right', color: '#888' }}>
                      <p>{x.score}</p>
                    </Col>
                  </Row>
                </span>
              ))}
        </Container>
        <br />
        <a href="/history" className="mayhem-link">
          VIEW MY FULL HISTORY
        </a>
        <br />
      </div>
    )
  }
}

export default CompletedGames
