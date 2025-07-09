import { START_SOLO_GAME, SOLO_GAME_FAIL, SOLO_GAME_SUCCESS } from '../constants/gameConstants'

const initialState = {
  message: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case START_SOLO_GAME:
      return { ...state, startingSoloGame: true, startedSoloGame: false }
    case SOLO_GAME_SUCCESS:
      return {
        ...state,
        startingSoloGame: false,
        startedSoloGame: true,
        solo_game: action.result.game,
        solo_player: action.result.solo_player,
        account: action.result.account,
        rounds: action.result.rounds,
      }
    case SOLO_GAME_FAIL:
      return {
        ...state,
        startingSoloGame: false,
        startedSoloGame: false,
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
