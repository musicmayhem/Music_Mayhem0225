import { combineReducers } from 'redux'
import { reducer as form } from 'redux-form'
import auth from './authReducer'
import index from './indexReducer'
import password from './passwordReducer'
import account from './accountReducer'
import game_code from './gameCodeReducer'
import feedback from './feedbackReducer'
import game from './gameReducer'
import guess from './guessReducer'
import solo from './soloGameReducer'
import pusher from './pusherReducer'
import player from './playerReducer'
import mirror from './mirrorReducer'

export default combineReducers({
  form,
  auth,
  index,
  password,
  account,
  game_code,
  feedback,
  game,
  guess,
  solo,
  pusher,
  player,
  mirror,
})
