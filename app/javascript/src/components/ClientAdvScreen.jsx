import React from 'react'
import { Container, Row, Col } from 'reactstrap'

class ClientAdvScreen extends React.Component {
  render() {
    const session = this.props.session
    return (
      <Container
        style={{
          height: '60vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Row>
          <Col>
            <h3 align="center" style={{ color: 'white', width: session ? '80%' : '100%' }}>
              standby while we find something good to play...
            </h3>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default ClientAdvScreen
