/* global window */
import React from 'react'
import GameCodeChecker from '../GameCodeChecker'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { checkUserIsLogin } from '../../actions/loginActions'
import { connect } from 'react-redux'

class GameCode extends React.Component {
  UNSAFE_componentWillMount() {
    this.props.dispatch(checkUserIsLogin()).then(res => {
      if (!res) this.props.history.push('/')
      else if (res.account.role != 'host') this.props.history.goBack()
    })
  }

  render() {
    return (
      <Container>
        <Col>
          <Row center="xs" style={{ padding: '10rem 0' }}>
            <GameCodeChecker changedButtonText={'WATCHING...'} buttonText={'WATCH'} {...this.props} monitor />
          </Row>
        </Col>
      </Container>
    )
  }
}

function mapStateToProps(store) {
  return {
    auth: store.auth,
    game: store.game,
  }
}

export default connect(mapStateToProps)(GameCode)
