import React from 'react'

// Compact tile reveal display for the player screen.
// visibleTitle / visibleArtist: arrays of chars where
//   '#'  = unrevealed letter
//   '^'  = space between words
//   else = revealed character (letters, digits, punctuation already visible)
const PlayerRevealTiles = ({ visibleTitle, visibleArtist, showTitleHint, showArtistHint }) => {
  if (!visibleTitle && !visibleArtist) return null

  const renderRow = (chars) => {
    if (!chars || chars.length === 0) return null

    // Group into words separated by space markers
    const groups = []
    let current = []
    chars.forEach((char, idx) => {
      if (char === '^') {
        if (current.length > 0) { groups.push({ isSpace: false, tiles: current }); current = [] }
        groups.push({ isSpace: true })
      } else {
        current.push({ char, idx })
      }
    })
    if (current.length > 0) groups.push({ isSpace: false, tiles: current })

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {groups.map((g, gi) =>
          g.isSpace
            ? <span key={gi} className="space-letter-sm" />
            : (
              <span key={gi} className="word-break-sm">
                {g.tiles.map(({ char, idx }) =>
                  char === '#'
                    ? <span key={idx} className="letter-sm hidden-letter-sm" />
                    : <span key={idx} className="letter-sm reveal-letter-sm">{char}</span>
                )}
              </span>
            )
        )}
      </div>
    )
  }

  return (
    <div className="player-reveal-tiles">
      {showTitleHint && visibleTitle && (
        <div>
          <div className="player-reveal-label">TITLE</div>
          {renderRow(visibleTitle)}
        </div>
      )}
      {showArtistHint && visibleArtist && (
        <div style={{ marginTop: '0.4rem' }}>
          <div className="player-reveal-label">ARTIST</div>
          {renderRow(visibleArtist)}
        </div>
      )}
    </div>
  )
}

export default PlayerRevealTiles
