import React from 'react'
import { Container, Button } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { INTERJECTION } from '../components/helper'
import VideoButton from './VideoButton'

class PlayerWelcomeScreen extends React.Component {
  render() {
    const openSession = this.props.session
    return (
      <Container style={{ width: openSession ? '75%' : '100%' }}>
        <br />
        <br />
        <br />
        <br />
        <Row center="xs" style={{ color: '#fff', padding: '0 30px' }}>
          <br />
          <br />
          <Col xs={12} md={7}>
            <Row center="xs" bottom="xs" style={{ color: '#fff', fontSize: '0.9rem' }}>
              <h2 style={{ lineHeight: '1', fontWeight: 'bold' }}>{INTERJECTION}</h2>
            </Row>
          </Col>
          <br />
          <br />
          <br />
          <br />
          <Col xs={12} md={7}>
            <Row center="xs" bottom="xs" style={{ color: '#fff', fontSize: '0.9rem' }}>
              <h4 style={{ lineHeight: '1', fontWeight: 'bold' }}>You&apos;re in!</h4>
              <h5 style={{ lineHeight: '1', fontWeight: 'bold' }}>
                Grab a drink and prepare for battle. Game starts soon(ish)
              </h5>
              <p style={{marginTop: '20px'}}>
                <VideoButton isButton={true} />
              </p>
            </Row>
          </Col>
        </Row>
        <br />
        <br />
      </Container>
    )
  }
}

export default PlayerWelcomeScreen
