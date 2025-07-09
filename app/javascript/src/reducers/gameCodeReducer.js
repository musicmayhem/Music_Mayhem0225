import { START_GAME_CODE_CHECK, GAME_CODE_CHECK_FAIL, GAME_CODE_CHECK_SUCCESS } from '../constants/gameConstants'

const initialState = {
  message: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_GAME_CODE_CHECK:
      return { ...state, gameCodeChecking: true, gameCodeValid: false }
    case GAME_CODE_CHECK_SUCCESS:
      return { ...state, gameCodeChecking: false, gameCodeValid: true, game: action.result }
    case GAME_CODE_CHECK_FAIL:
      return {
        ...state,
        gameCodeChecking: false,
        gameCodeValid: false,
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
