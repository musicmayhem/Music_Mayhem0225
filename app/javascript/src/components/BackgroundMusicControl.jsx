/* global setTimeout */
import React, { Component } from 'react'
import { Button, Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'

class BackgroundMusicControl extends Component {
  render() {
    return (
      <Container>
        <br />
        <Row center='xs'>
          <label style={{ color: 'white' }}>BACKGROUND MUSIC VOLUME</label>
        </Row>
        <br />
        <Row center="xs">
          <Col xs={6} sm={6} start="xs">
            {' '}
            <Button
              className="mayhem-btn-yellow"
              style={{ width: '15vmax' }}
              onClick={() => {
                this.props.volumeChange('bcg_up')
              }}
            >
              {' '}
              Vol +{' '}
            </Button>
          </Col>
          <Col xs={6} sm={6}>
            {' '}
            <Button
              className="mayhem-btn-yellow"
              style={{ width: '15vmax' }}
              onClick={() => {
                this.props.volumeChange('bcg_down')
              }}
            >
              Vol -{' '}
            </Button>
          </Col>
          <br />
        </Row>
      </Container>
    )
  }
}

export default BackgroundMusicControl
