/*global setTimeout window document*/
import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import SongPicture from './SongPicture'
import { connect } from 'react-redux'
import { updateGameRequest } from '../actions/hostGameActions'
import Swal from 'sweetalert2'
import { songFadeOut } from '../components/helper'

class DemoSongEnd extends React.Component {
  UNSAFE_componentWillMount() {
    if (this._showModal) {
      this._showModal = false
      Swal.fire({
        title: 'REGISTER NOW',
        text: 'CLICK ON CREATE ACCOUNT TO REGISTER',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#7a2135',
        confirmButtonText: 'CREATE ACCOUNT',
        cancelButtonText: 'KEEP PLAYING',
      }).then(result => {
        if (result.value) window.open('/sign_up')
        else if (result.dismiss) this.playAgain()
      })
    }
  }

  playAgain = () => {
    if (!this._clicked) {
      this._clicked = true
      songFadeOut()
      setTimeout(() => {
        this.props.dispatch(updateGameRequest({ state: 'Song Ended', code: this.props.game.code }))
        let element = document.getElementById('songPlayer')
        if(element) element.parentNode.removeChild(element)
      }, 6000)
    }
  }

  _showModal = true
  _clicked = false

  render() {
    const { loadedSong, currentSongScores } = this.props
    const score = currentSongScores ? (currentSongScores.length > 0 ? currentSongScores[0].current_song_score : 0) : 0
    return (
      <Container>
        <Row center="xs">
          <Col xs={12} style={{ padding: 0 }}>
            <div style={{ marginTop: '11rem', background: 'white', paddingTop: '3rem' }}>
              <SongPicture
                song={{
                  url: loadedSong.itunes_artwork_url
                    ? loadedSong.itunes_artwork_url
                    : 'http://dalelyles.com/musicmp3s/no_cover.jpg',
                  name: loadedSong.title,
                  artist: loadedSong.artist,
                }}
              />
              <Container style={{ background: 'white' }}>
                <Row
                  center="xs"
                  style={{ borderBottom: '1px solid #aaa', borderTop: '1px solid #aaa', margin: '0 0.8rem' }}
                >
                  <Col className="col-pad-y">
                    <p className="property-value">
                      <b>{score}</b>
                    </p>
                    <p className="property-name">
                      <b>Points Scored</b>
                    </p>
                  </Col>
                </Row>
              </Container>
              <a
                className="pink-link"
                style={{ marginTop: '2rem' }}
                onClick={() => {
                  window.close()
                }}
              >
                Quit Game
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }
}

function mapStateToProps(store) {
  return {
    guess: store.guess,
  }
}

export default connect(mapStateToProps)(DemoSongEnd)
