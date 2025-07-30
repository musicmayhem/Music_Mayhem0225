import React from 'react'
import QAGameScreenBig from './QAGameScreenBig'
import GameScreenBig from './GameScreenBig'

const ScreenRouter = ({game}) => {
  const { isQA } = game 
  console.log(game)
  return (
    <div className="max-w-md mx-auto mt-8">
      {isQA ? (
        <QAGameScreenBig game={game} />
      ) : (
        <GameScreenBig game={game} />
      )}
    </div>
  );
};

export default ScreenRouter 