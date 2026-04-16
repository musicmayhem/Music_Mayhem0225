/* global document navigator setTimeout setInterval window*/
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { setActiveSong, updateGameRequest } from '../actions/hostGameActions'
import ReactHtmlParser from 'react-html-parser'
import { postRequest } from '../actions/gameAction'

// Pure functional component — no Redux dependency.
// Receives dispatched action callbacks via props.
export const GameScreenBig = ({ game, mirror, demo, onSetActiveSong, onPostRequest, onUpdateGameRequest }) => {
  const _leaderboardRequest = useRef(true)
  const titleHashRef = useRef({})
  const artistHashRef = useRef({})
  const titleRef = useRef(game.songName.split(''))
  const artistRef = useRef(game.artist.split(''))
  // Copies so we never mutate the prop arrays
  const titleSeqRef = useRef([...game.seq.title])
  const artistSeqRef = useRef([...game.seq.artist])
  const revealInterval = useRef(game.time / (game.seq.title.length + game.seq.artist.length))
  const timeRef = useRef(game.time)
  // Wall-clock timestamp after which tile reveals are allowed.
  // Set when audio starts; accounts for letterStartTime offset.
  const revealAllowedAtRef = useRef(null)

  const songPlayTime =
    game.songPlayTime == 0
      ? (parseInt(game.currentSong.length_in_seconds) - game.time) * 1000
      : (parseInt(game.songPlayTime) - game.time) * 1000

  const diff = game.points / game.time

  const makeTitleHash = (string) => {
    let stringHashArray = []
    if (game) {
      let stringArray = string.split('')
      let counter = 1
      for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i].match(/^[a-z0-9]/i)) {
          titleHashRef.current[counter] = stringArray[i]
          counter++
          stringHashArray.push('#')
        } else if (stringArray[i] === ' ') {
          titleHashRef.current['s@' + i] = stringArray[i]
          stringHashArray.push('^')
        } else {
          titleHashRef.current['v@' + i] = stringArray[i]
          stringHashArray.push(stringArray[i])
        }
      }
      return stringHashArray
    }
  }

  const makeArtistHash = (string) => {
    let stringHashArray = []
    if (game) {
      let stringArray = string.split('')
      let counter = 1
      for (let i = 0; i < stringArray.length; i++) {
        if (stringArray[i].match(/^[a-z0-9]/i)) {
          artistHashRef.current[counter] = stringArray[i]
          counter++
          stringHashArray.push('#')
        } else if (stringArray[i] === ' ') {
          artistHashRef.current['s@' + i] = stringArray[i]
          stringHashArray.push('^')
        } else {
          artistHashRef.current['v@' + i] = stringArray[i]
          stringHashArray.push(stringArray[i])
        }
      }
      return stringHashArray
    }
  }

  const [time, setTime] = useState(game.time)
  const [isPlaying, setIsPlaying] = useState(false)
  const [allTilesRevealed, setAllTilesRevealed] = useState(false)
  const [visibleSongName, setVisibleSongName] = useState(() => makeTitleHash(game.songName))
  const [visibleArtistName, setVisibleArtistName] = useState(() => makeArtistHash(game.artist))

  // Update tiles progressively with balanced reveal.
  // At each tick, pick from whichever sequence has the higher remaining ratio
  // so both title and artist finish at the same time regardless of length.
  const updateTiles = useCallback(() => {
    if (titleSeqRef.current.length === 0 && artistSeqRef.current.length === 0) {
      setAllTilesRevealed(true)
      return
    }

    const titleRemaining = titleSeqRef.current.length
    const artistRemaining = artistSeqRef.current.length
    const titleRatio = titleRemaining / (titleRemaining + artistRemaining)
    const shouldRevealTitle = Math.random() < titleRatio

    if (shouldRevealTitle && titleSeqRef.current.length > 0) {
      const nextIndex = titleSeqRef.current.shift()
      const char = titleHashRef.current[nextIndex]
      if (char) {
        const replacableIndex = titleRef.current.indexOf(char)
        setVisibleSongName(prev => {
          const temp = [...prev]
          temp[replacableIndex] = char
          return temp
        })
        titleRef.current[replacableIndex] = '-'
      }
    } else if (artistSeqRef.current.length > 0) {
      const nextIndex = artistSeqRef.current.shift()
      const char = artistHashRef.current[nextIndex]
      if (char) {
        const replacableIndex = artistRef.current.indexOf(char)
        setVisibleArtistName(prev => {
          const temp = [...prev]
          temp[replacableIndex] = char
          return temp
        })
        artistRef.current[replacableIndex] = '-'
      }
    } else if (titleSeqRef.current.length > 0) {
      // Artist exhausted early — drain remaining title
      const nextIndex = titleSeqRef.current.shift()
      const char = titleHashRef.current[nextIndex]
      if (char) {
        const replacableIndex = titleRef.current.indexOf(char)
        setVisibleSongName(prev => {
          const temp = [...prev]
          temp[replacableIndex] = char
          return temp
        })
        titleRef.current[replacableIndex] = '-'
      }
    }

    if (titleSeqRef.current.length === 0 && artistSeqRef.current.length === 0) {
      setAllTilesRevealed(true)
    }
  }, [])

  // Builds a fully revealed display array from the original string.
  // Alphanumeric chars are shown as-is, spaces become '^', special chars
  // are already visible so they pass through unchanged.
  const buildFullRevealArray = (string) =>
    string.split('').map(char => (char === ' ' ? '^' : char))

  // Instantly reveals all remaining tiles — called on guessEnd so the
  // answer is always visible by the time the leaderboard/reveal screen appears.
  const revealAllRemaining = useCallback(() => {
    titleSeqRef.current = []
    artistSeqRef.current = []
    setVisibleSongName(buildFullRevealArray(game.songName))
    setVisibleArtistName(buildFullRevealArray(game.artist))
    setAllTilesRevealed(true)
  }, [game.songName, game.artist]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fires once when the guess window closes
  const handleGuessEnd = useCallback(() => {
    if (mirror || !_leaderboardRequest.current) return
    _leaderboardRequest.current = false
    revealAllRemaining()
    onPostRequest('games/pusher_update', {
      values: { game: { code: game.gameCode, status: 'guessEnd' } },
    })
    setTimeout(() => {
      onUpdateGameRequest({ game: { code: game.gameCode, state: 'Showing LeaderBoard' } })
    }, songPlayTime)
  }, [mirror, game.gameCode, songPlayTime, revealAllRemaining, onPostRequest, onUpdateGameRequest])

  // Audio setup — runs once on mount
  useEffect(() => {
    if (demo) document.getElementsByTagName('body')[0].style.padding = 0

    createAudioElement()

    const player = document.getElementById('songPlayer')
    if (player) {
      player.onplaying = () => {
        if (!mirror) {
          onSetActiveSong({
            song: { id: game.currentSong.id },
            game: { code: game.gameCode },
          })
        }
        revealAllowedAtRef.current = Date.now() + (game.letterStartTime || 0) * 1000
        setIsPlaying(true)
      }
    }

    const playButton = document.getElementById('playButton')
    if (playButton) playButton.onclick = startAudio

    return () => {
      if (demo) document.getElementsByTagName('body')[0].style.paddingTop = '5rem'
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer countdown — runs independently of tile reveals so handleGuessEnd
  // always fires when time hits 0, even if allTilesRevealed triggered first.
  useEffect(() => {
    if (!isPlaying) return

    const timerInterval = setInterval(() => {
      if (timeRef.current > 0) {
        timeRef.current -= 1
        setTime(timeRef.current)
      } else {
        clearInterval(timerInterval)
        handleGuessEnd()
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [isPlaying, handleGuessEnd])

  // Tile reveal — honours letterStartTime, pause/resume, and adjusted intervals.
  //
  // letterStartTime: reveals don't begin until that many seconds after the song
  //   starts. We use a wall-clock ref (revealAllowedAtRef) so that if the reveal
  //   is paused and resumed before the delay has elapsed, only the *remaining*
  //   portion of the delay is waited — not the full delay again.
  //
  // On every (re-)start (initial start or resume after pause) the interval is
  //   recalculated as timeRef.current / remainingLetters so all tiles finish
  //   exactly when the timer hits 0.
  useEffect(() => {
    if (!isPlaying || allTilesRevealed || game.revealPaused) return

    let revealIntervalId

    const startReveal = () => {
      const remainingLetters = titleSeqRef.current.length + artistSeqRef.current.length
      const adjustedInterval =
        remainingLetters > 0 && timeRef.current > 0
          ? timeRef.current / remainingLetters
          : revealInterval.current
      revealIntervalId = setInterval(updateTiles, adjustedInterval * 1000)
    }

    // How long until reveals are allowed (0 if the delay has already passed).
    const delayMs = Math.max(0, (revealAllowedAtRef.current || 0) - Date.now())
    const startDelayId = delayMs > 0 ? setTimeout(startReveal, delayMs) : (startReveal(), undefined)

    return () => {
      clearTimeout(startDelayId)
      clearInterval(revealIntervalId)
    }
  }, [isPlaying, allTilesRevealed, game.revealPaused, updateTiles])

  const startAudio = () => {
    const player = document.getElementById('songPlayer')
    if (player) player.play()
    const element = document.getElementById('playButton')
    if (element) element.parentNode.removeChild(element)
  }

  const createAudioElement = () => {
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      let x = document.createElement('AUDIO')
      x.autoplay = true
      x.id = 'songPlayer'
      x.preload = 'auto'
      x.volume = 0.8
      if (x.canPlayType('audio/mpeg')) x.setAttribute('src', game.songLink)
      else window.alert('Sorry the song cannot be played on your browser.')

      x.oncanplaythrough = function() {
        if (document.getElementById('playButton')) document.getElementById('playButton').style.display = 'block'
      }
      var btn = document.createElement('BUTTON')
      btn.innerText = 'Play'
      btn.id = 'playButton'
      btn.classList.add('play-btn-css')
      document.getElementById('playButtonDiv').appendChild(btn)
      document.getElementById('playButton').style.display = 'none'
      document.body.appendChild(x)
    } else {
      let x = document.createElement('AUDIO')
      x.id = 'songPlayer'
      x.preload = 'auto'
      x.autoplay = true
      x.volume = 0.8
      x.currentTime = game.songStartTime || 0
      if (x.canPlayType('audio/mpeg')) x.setAttribute('src', game.songLink)
      else window.alert('Sorry the song cannot be played on your browser.')

      x.setAttribute('controls', 'controls')
      document.body.appendChild(x)
    }
  }

  const renderTiles = (hashString) => {
    let letters = hashString.map((char, key) => {
      if (char == '#') return `<div key=${key} class='letter-big hidden-letter-big'></div>`
      else if (char == '^') return `<div key=${key} class='letter-big space-letter-big'></div>`
      else return `<div key=${key} class='letter-big reveal-letter-big'>${char}</div>`
    })
    letters.push(`<div key=${hashString.length} class='letter-big space-letter-big'></div>`)
    let sentence = makeWords(letters)
    return <div>{ReactHtmlParser(sentence)}</div>
  }

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

  const pointTimer = Math.floor(time * diff)
  const song_count = game.songCount
  const { show_title_hint, show_artist_hint } = game

  return (
    <div style={{ color: '#fff' }}>
      {!demo && (
        <div className="yellow-header" style={{ marginBottom: 0 }}>
          <div className="timer">
            GOMAYHEM.COM <b>{game.gameCode}</b>
          </div>
          <div />
        </div>
      )}
      {true && (
        <div>
          <Row middle="xs" center="xs" style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <Col xs={12}>
              {!demo && (
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
                  {song_count}
                </h4>
              )}
              <h2
                className="mayhem-purple"
                style={{
                  textTransform: 'uppercase',
                  fontWeight: '600',
                  marginBottom: '0',
                  color: '#ffca27',
                  float: 'right',
                }}
              >
                <i className="fa fa-clock-o" style={{ verticalAlign: 'middle' }} /> {pointTimer} Points
              </h2>
            </Col>
          </Row>
          {show_title_hint && (
            <div style={{ padding: '2rem 2rem' }}>
              <div>
                <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>SONG TITLE</h2>
              </div>
              <Row center="xs">
                <Col xs={12} style={{ perspective: '800px' }}>
                  {renderTiles(visibleSongName)}
                </Col>
              </Row>
            </div>
          )}
          {show_artist_hint && (
            <div style={{ padding: '2rem 2rem' }}>
              <div>
                <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>ARTIST</h2>
              </div>
              <Row center="xs">
                <Col xs={12} style={{ perspective: '800px' }} className="tile-displayer">
                  {renderTiles(visibleArtistName)}
                </Col>
              </Row>
            </div>
          )}
          {!show_title_hint && !show_artist_hint && (
            <div style={{ padding: '4rem 4rem' }}>
              <div>
                <h2 style={{ fontWeight: '900', textAlign: 'center', color: '#ffca27', fontSize: '10vmax' }}>BLIND ROUND</h2>
              </div>
            </div>
          )}
        </div>
      )}
      <div id="playButtonDiv" />
    </div>
  )
}

// Redux container — wires action dispatchers as props, keeps GameScreenBig Redux-free.
const mapDispatchToProps = dispatch => ({
  onSetActiveSong: (params) => dispatch(setActiveSong(params)),
  onUpdateGameRequest: (params) => dispatch(updateGameRequest(params)),
  onPostRequest: (path, params) => dispatch(postRequest(path, params)),
})

export default connect(null, mapDispatchToProps)(GameScreenBig)
