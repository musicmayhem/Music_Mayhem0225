import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import CompletedGames from './CompletedGames'
import UserPicture from './UserPicture'
import { checkUserIsLogin } from '../actions/loginActions'
import Loader from './Loader'
import { makeRequest } from '../actions/gameAction'
import { CAREER_DATA_SUCCESS } from '../constants/indexConstants'

class Main extends React.Component {
  state = {
    reward: null,
  }
  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) this.props.history.push('/')
      else this.props.makeRequest('games/career_data', { type: CAREER_DATA_SUCCESS })
    })
  }

  render() {
    const {
      username,
      logo,
      played_games,
      avg_points,
      games_won,
      points,
      games_played_count,
      best_era,
      best_genre,
      winning_percentage,
      max_score,
      muted,
      userEra,
      userGenre,
    } = this.props.index
    let user = {
      avatar: logo,
      username: username,
    }
    console.log(userGenre)
    const { reward } = this.state
    return (
      <Container>
        {!this.props.index.getting_data && <Loader />}
        {this.props.index.getting_data && (
          <Row center="xs" className="career-page">
            <Col xs={12} style={{ padding: 0, marginTop: '7rem' }}>
              {!reward && (
                <div className="white-back">
                  <UserPicture user={user} />
                  <Container>
                    <Row
                      center="xs"
                      style={{ borderBottom: '1px solid #aaa', margin: '0 0.8rem', borderTop: '1px solid #aaa' }}
                    >
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">{points}</p>
                        <p className="property-name">
                          TOTAL <br /> POINTS
                        </p>
                      </Col>
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">{max_score}</p>
                        <p className="property-name">
                          HIGHEST <br /> SCORE
                        </p>
                      </Col>
                      <Col xs={4} className="col-pad-y">
                        <p className="property-value">{avg_points}</p>
                        <p className="property-name">
                          AVERAGE <br /> POINTS
                        </p>
                      </Col>
                    </Row>
                    <Row center="xs" style={{ borderBottom: '1px solid #aaa', margin: '0 0.8rem' }}>
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">{games_won}</p>
                        <p className="property-name">
                          GAMES <br /> WON
                        </p>
                      </Col>
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">{games_played_count}</p>
                        <p className="property-name">
                          GAMES <br /> PLAYED
                        </p>
                      </Col>
                      <Col xs={4} className="col-pad-y">
                        <p className="property-value">{winning_percentage}</p>
                        <p className="property-name">
                          WINNING <br /> PERCENTAGE
                        </p>
                      </Col>
                    </Row>
                    <Row
                      center="xs"
                      style={{ borderBottom: '1px solid #aaa', margin: '0 0.8rem', paddingBottom: '2rem' }}
                    >
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">{best_genre}</p>
                        <p className="property-name">BEST GENRE</p>
                      </Col>
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">{muted}</p>
                        <p className="property-name">NO. OF TIMES MUTED</p>
                      </Col>
                      <Col xs={4} className="col-pad-y">
                        <p className="property-value">{best_era}</p>
                        <p className="property-name">BEST ERA</p>
                      </Col>
                    </Row>
                    <Row
                      center="xs"
                      style={{ borderBottom: '1px solid #aaa', margin: '0 0.8rem', paddingBottom: '2rem' }}
                    >
                      <Col xs={4} className="col-pad-y" style={{ borderRight: '1px solid #aaa' }}>
                        <p className="property-value">
                          {userEra && Array.isArray(userEra) && userEra.length > 0 &&
                            userEra.map(p => (
                              <span key={p}>
                                {p}
                                <br />
                              </span>
                            ))}
                        </p>
                        <p className="property-name">My ERA</p>
                      </Col>
                      <Col xs={4} className="col-pad-y">
                        <p className="property-value">
                          {userGenre && Array.isArray(userGenre) && userGenre.length > 0 &&
                            userGenre.map(p => (
                              <span key={p}>
                                {p}
                                <br />
                              </span>
                            ))}
                        </p>
                        <p className="property-name">My GENRE</p>
                      </Col>
                    </Row>
                  </Container>
                  <br />
                  <CompletedGames played_games={played_games} />
                </div>
              )}
            </Col>
          </Row>
        )}
      </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
      index: state.index,
    }
  },
  mapDispatchToProps
)(Main)
