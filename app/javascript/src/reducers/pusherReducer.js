import { UPDATE_PUSHER_REQUEST } from '../constants/pusherConstants'
import { RESET_GAME_DATA } from '../constants/gameConstants'

const initialState = {
  state: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case RESET_GAME_DATA:
      return { ...state, pusherData: null }
    case UPDATE_PUSHER_REQUEST:
      return { ...state, pusherData: action.result }
    default:
      return state
  }
}
