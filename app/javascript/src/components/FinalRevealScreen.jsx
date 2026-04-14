/* global document setTimeout */
import React, { useEffect, useCallback } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { updateGameRequest, addNewRound } from '../actions/hostGameActions'
import { postRequest } from '../actions/gameAction'
import { songFadeOut } from '../components/helper'

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

      <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontWeight: '600', color: '#ffca27', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          SONG TITLE
        </h2>
        <h1
          style={{
            fontWeight: '900',
            fontSize: '6vmax',
            color: '#fff',
            textTransform: 'uppercase',
            marginBottom: '3rem',
            marginTop: '0.5rem',
          }}
        >
          {title}
        </h1>

        <h2 style={{ fontWeight: '600', color: '#ffca27', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          ARTIST
        </h2>
        <h1
          style={{
            fontWeight: '900',
            fontSize: '5vmax',
            color: '#fff',
            textTransform: 'uppercase',
            marginTop: '0.5rem',
          }}
        >
          {artist}
        </h1>
      </div>
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
