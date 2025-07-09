/* global window document*/
import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import SongPicture from './SongPicture'
import HeaderLoader from './Utils/HeaderLoader'
import { connect } from 'react-redux'

class PlayerSongEnd extends React.Component {
  componentDidMount() {
    document.getElementsByClassName('nav-bar-hamburger')[0].style.zIndex = '101'
    document.getElementsByClassName('nav-bar-content')[0].style.zIndex = '99'
  }
  componentWillUnmount() {
    document.getElementsByClassName('nav-bar-hamburger')[0].style.zIndex = 'auto'
    document.getElementsByClassName('nav-bar-content')[0].style.zIndex = '99'
  }

  handleClose() {
    window.close()
  }

  render() {
    const songDetails = this.props.songDetails
    const session = this.props.session
    return (
      <Container>
        <Row center="xs">
          <HeaderLoader msg={'Next Song Loading...'} completed={80} />
          <Col xs={12} style={{ padding: 0 }}>
            <div
              style={{ marginTop: '11rem', background: 'white', paddingTop: '3rem', width: session ? '85%' : '100%' }}
            >
              <SongPicture
                song={{
                  url: songDetails.itunes_artwork_url
                    ? songDetails.itunes_artwork_url
                    : 'http://dalelyles.com/musicmp3s/no_cover.jpg',
                  name: songDetails.title,
                  artist: songDetails.artist,
                  year: songDetails.year,
                }}
              />
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

export default connect(mapStateToProps)(PlayerSongEnd)
