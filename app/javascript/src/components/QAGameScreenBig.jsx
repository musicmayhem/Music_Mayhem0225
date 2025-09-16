
// Functional component for QA-type songs
import React, { useEffect, useRef, useState } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { setActiveSong, updateGameRequest } from '../actions/hostGameActions'
import { postRequest } from '../actions/gameAction'

export function QAGameScreenBig({
  game, setActiveSong, updateGameRequest, postRequest, mirror = false
}) {
  // Question is in game.songName, answer is in game.artist
  const question = game.songName || ''
  const answer = game.artist || ''
  const revealOrder = game.seq.artist || [] // Order in which to reveal letters
  const answerArray = answer.split('')
  const [revealed, setRevealed] = useState(Array(answerArray.length).fill(false))
  const [time, setTime] = useState(game.time)
  const [gameStarted, setGameStarted] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const intervalRef = useRef(null)
  const revealIntervalRef = useRef(null)
  const leaderboardRequestRef = useRef(true)

  // Reveal answer letters based on the order specified in game.seq.artist
  useEffect(() => {
    if (!gameStarted || !revealOrder.length) return
    
    let revealIndex = 0
    const intervalTime = Math.max(1000, (game.time * 1000) / (revealOrder.length + 1))
    console.log(revealed)
    
    revealIntervalRef.current = setInterval(() => {
      setRevealed(prev => {
        if (revealIndex < revealOrder.length) {
          const next = [...prev]
          const letterIndex = revealOrder[revealIndex] - 1
          // Make sure the index is valid and within bounds
          if (letterIndex >= 0 && letterIndex < answerArray.length) {
            next[letterIndex] = true
          }
          revealIndex++
          return next
        }
        return prev
      })
    }, intervalTime)
    
    return () => clearInterval(revealIntervalRef.current)
  }, [gameStarted, revealOrder, answerArray.length, game.time])

  // Timer countdown
  useEffect(() => {
    if (!gameStarted) return
    intervalRef.current = setInterval(() => {
      setTime(prev => {
        if (prev > 0) return prev - 1
        else return 0
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [gameStarted])

  // When time runs out, show leaderboard
  useEffect(() => {
    if (time === 0 && gameStarted) {
      clearInterval(intervalRef.current)
      clearInterval(revealIntervalRef.current)
      
      if (leaderboardRequestRef.current && !mirror) {
        showLeaderBoardRequest()
        leaderboardRequestRef.current = false
      }
    }
  }, [time, gameStarted, mirror])

  // Start game on mount
  useEffect(() => {
    setGameStarted(true)
    setTime(game.time)
    setRevealed(Array(answerArray.length).fill(false))
    setShowLeaderboard(false)
    leaderboardRequestRef.current = true
    if (!mirror) {
        setActiveSong({
          song: { id: game.currentSong.id },
          game: { code: game.gameCode },
        })
      }
    
    return () => {
      clearInterval(intervalRef.current)
      clearInterval(revealIntervalRef.current)
    }
  }, [game.id])

  // Show leaderboard request similar to GameScreenBig
  const showLeaderBoardRequest = () => {
    if (!mirror) {
      postRequest('games/pusher_update', {
        values: { game: { code: game.gameCode, status: 'guessEnd' } },
      })
      setTimeout(() => {
        updateGameRequest({ game: { code: game.gameCode, state: 'Showing LeaderBoard' } })
        setGameStarted(false)
      }, 2000) // Give some time for the leaderboard to show
    }
  }

  // Render tiles for question (fully revealed)
  function renderQuestionTiles() {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {question.split('').map((char, idx) => (
          <div key={idx} className={char === ' ' ? 'letter-big space-letter-big' : 'letter-big reveal-letter-big'}>
            {char === ' ' ? '' : char}
          </div>
        ))}
      </div>
    )
  }

  // Render tiles for answer (revealed as hints based on sequence)
  function renderAnswerTiles() {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {answerArray.map((char, idx) => (
          <div key={idx} className={char === ' ' ? 'letter-big space-letter-big' : revealed[idx] ? 'letter-big reveal-letter-big' : 'letter-big hidden-letter-big'}>
            {char === ' ' ? '' : revealed[idx] ? char : ''}
          </div>
        ))}
      </div>
    )
  }


  // UI
  return (
    <div style={{ color: '#fff' }}>
        <div className="yellow-header" style={{ marginBottom: 0 }}>
          <div className="timer">
            GOMAYHEM.COM QA<b>{game.gameCode}</b>
          </div>
          <div />
        </div>
      <div>
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
                {game.songCount}
              </h4>
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
              <i className="fa fa-clock-o" style={{ verticalAlign: 'middle' }} /> {time} Seconds
            </h2>
          </Col>
        </Row>
        <div style={{ padding: '2rem 2rem' }}>
          <div>
            <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>QUESTION</h2>
          </div>
          <Row center="xs">
            <Col xs={12} style={{ perspective: '800px' }}>
              {renderQuestionTiles()}
            </Col>
          </Row>
        </div>
        <div style={{ padding: '2rem 2rem' }}>
          <div>
            <h2 style={{ fontWeight: '600', textAlign: 'center', color: '#ffca27' }}>ANSWER</h2>
          </div>
          <Row center="xs">
            <Col xs={12} style={{ perspective: '800px' }} className="tile-displayer">
              {renderAnswerTiles()}
            </Col>
          </Row>
        </div>
        {showLeaderboard && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={handleShowLeaderboard}>
              Show Leaderboard
            </button>
            <button className="btn btn-secondary" onClick={handleNextQuestion} style={{ marginLeft: '1rem' }}>
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const mapDispatchToProps = dispatch => {
  return {
    setActiveSong: (params, type) => dispatch(setActiveSong(params, type)),
    updateGameRequest: (params, type) => dispatch(updateGameRequest(params, type)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
    }
  },
  mapDispatchToProps
)(QAGameScreenBig)