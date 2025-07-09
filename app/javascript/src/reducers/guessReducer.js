import {
  PLAYER_GUESS,
  PLAYER_GUESS_FAILED,
  PLAYER_GUESS_SUCCESS,
  RESET_GUESS_DATA,
  PLAYER_TOTAL_SCORE,
} from '../constants/playerConstants'

const initialState = {
  message: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PLAYER_TOTAL_SCORE:
      return { ...state, total_score: action.result.total_score }
    case RESET_GUESS_DATA:
      return { ...state, guessData: null }
    case PLAYER_GUESS:
      return { ...state, playerGuessing: true, playerGuessed: false }
    case PLAYER_GUESS_SUCCESS:
      return {
        ...state,
        playerGuessing: false,
        playerGuessed: true,
        guessData: action.result.guess,
        total_score: action.result.score,
      }
    case PLAYER_GUESS_FAILED:
      return {
        ...state,
        playerGuessing: false,
        playerGuessed: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    default:
      return state
  }
}
