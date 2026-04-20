/* global document setTimeout */
import React, { useEffect, useCallback } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { updateGameRequest, addNewRound } from '../actions/hostGameActions'
import { postRequest } from '../actions/gameAction'
import { songFadeOut } from '../components/helper'
import ReactHtmlParser from 'react-html-parser'

const buildFullRevealArray = (string) =>
  string.split('').map((char) => (char === ' ' ? '^' : char))

const makeWords = (strings) => {
  var newString = []
  strings.forEach((s, i) => {
    var div = document.createElement('DIV')
    div.innerHTML = s
    if (i === -1) {
      newString.push('<div class="word-break">')
      newString.push(s)
    }
    if (div.firstChild.classList.contains('space-letter-big') && i !== strings.length - 1)
      newString.push('</div><div class="word-break">')
    else if (i === strings.length - 1) newString.push('</div>')
    else newString.push(s)
  })
  return newString.join('')
}

const renderTiles = (hashString) => {
  let letters = hashString.map((char, key) => {
    if (char === '#')
      return `<div key=${key} class='letter-big hidden-letter-big'></div>`
    else if (char === '^')
      return `<div key=${key} class='letter-big space-letter-big'></div>`
    else
      return `<div key=${key} class='letter-big reveal-letter-big'>${char}</div>`
  })
  letters.push(`<div key=${hashString.length} class='letter-big space-letter-big'></div>`)
  return <div>{ReactHtmlParser(makeWords(letters))}</div>
}

// Shown in place of the leaderboard when show_scoreboard is false.
// Displays the fully revealed song title and artist, then auto-advances
// to the next song using the same timing logic as Leaderboard.
const FinalRevealScreen = ({
  // from parent (MusicMayhemGame)
  openSession,
  lastSongOfGame,
  automaticSongAdvance,
  gameCode,
  loadedSong,
  songCount,
  game_code_display,
  show_title_hint,
  show_artist_hint,
  // from Redux state
  game,
  // dispatched actions
  onUpdateGameRequest,
  onPostRequest,
  onAddNewRound,
}) => {
  const displayTime = game.rounds.settings.leaderboard_display_time * 1000

  const sendNextEvent = useCallback(() => {
    songFadeOut()
    setTimeout(() => {
      const element = document.getElementById('songPlayer')
      if (element) element.parentNode.removeChild(element)
    }, 11000)

    if (openSession && lastSongOfGame) {
      if (game.game.automatic_round_advance)
        onAddNewRound({ game: { code: gameCode } })
      if (game.game.jukebox_mode) {
        onPostRequest('games/pusher_update', {
          values: { game: { code: gameCode, status: 'askPlayerContinue' } },
        })
      }
    } else if (!openSession && lastSongOfGame) {
      onPostRequest('games/pusher_update', {
        values: { game: { code: gameCode, status: 'gameOver' } },
      })
    } else {
      setTimeout(() => {
        onUpdateGameRequest({ state: 'Song Ended', code: gameCode })
      }, 11000)
    }
  }, [openSession, lastSongOfGame, gameCode, game.game.automatic_round_advance, game.game.jukebox_mode, onAddNewRound, onPostRequest, onUpdateGameRequest])

  useEffect(() => {
    if (!automaticSongAdvance) return
    const timer = setTimeout(sendNextEvent, displayTime)
    return () => clearTimeout(timer)
  }, [automaticSongAdvance, displayTime, sendNextEvent])

  const { title, artist } = loadedSong
  const titleTiles = buildFullRevealArray(title)
  const artistTiles = buildFullRevealArray(artist)

  return (
    <div style={{ color: '#fff' }}>
      <div className="yellow-header" style={{ marginBottom: 0 }}>
        <div className="timer">
          GOMAYHEM.COM{game_code_display && <b> {gameCode}</b>}
        </div>
        <div />
      </div>

      <Row middle="xs" center="xs" style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Col xs={12}>
          <h4
            style={{
              textTransform: 'uppercase',
              fontWeight: '600',
              marginBottom: '0',
              marginTop: '0.3rem',
              float: 'left',
              verticalAlign: 'middle',
            }}
          >
            {songCount}
          </h4>
        </Col>
      </Row>

      {show_title_hint && (
        <div style={{ padding: '2rem 2rem' }}>
          <div>
            <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>
              SONG TITLE
            </h2>
          </div>
          <Row center="xs">
            <Col xs={12} style={{ perspective: '800px' }}>
              {renderTiles(titleTiles)}
            </Col>
          </Row>
        </div>
      )}

      {show_artist_hint && (
        <div style={{ padding: '2rem 2rem' }}>
          <div>
            <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>
              ARTIST
            </h2>
          </div>
          <Row center="xs">
            <Col xs={12} style={{ perspective: '800px' }} className="tile-displayer">
              {renderTiles(artistTiles)}
            </Col>
          </Row>
        </div>
      )}

      {!show_title_hint && !show_artist_hint && (
        <div style={{ padding: '4rem 4rem' }}>
          <h2
            style={{
              fontWeight: '900',
              textAlign: 'center',
              color: '#ffca27',
              fontSize: '10vmax',
            }}
          >
            BLIND ROUND
          </h2>
        </div>
      )}

      {/* Hidden button targeted by the advance_next_song pusher handler in MusicMayhemGame */}
      <button id="next-song-btn" onClick={sendNextEvent} style={{ display: 'none' }} />
    </div>
  )
}

const mapStateToProps = state => ({
  game: state.game,
})

const mapDispatchToProps = dispatch => ({
  onUpdateGameRequest: params => dispatch(updateGameRequest(params)),
  onPostRequest: (path, params) => dispatch(postRequest(path, params)),
  onAddNewRound: params => dispatch(addNewRound(params)),
})

export default connect(mapStateToProps, mapDispatchToProps)(FinalRevealScreen)
