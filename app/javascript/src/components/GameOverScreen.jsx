import React from 'react'
import GameOver from '../images/game_over_logo.png'
import { Container, Row, Col } from 'reactstrap'
import { Link } from 'react-router-dom'

class GameOverScreen extends React.Component {
  render() {
    const { sharedScreen, configScreen } = this.props
    return (
      <Container>
        <Row center="xs" style={{ height: '80vh' }}>
          <Col xs={12} style={{ marginTop: '30vh' }}>
            <img src={GameOver} width="100%" />
            {configScreen && (
              <div
                style={{ margin: '0 auto', textAlign: 'center' }}
                className="mayhem-link-light"
                onClick={() => {
                  this.props.resetGameFromOverScreen(true)
                }}
              >
                Reset Game
              </div>
            )}
            <Link to="/index">
              {!configScreen && !sharedScreen && (
                <div style={{ margin: '0 auto', textAlign: 'center' }} className="mayhem-link-light">
                  RETURN HOME
                </div>
              )}
            </Link>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default GameOverScreen
