import {
  CREATE_PLAYER,
  CREATE_PLAYER_FAILED,
  CREATE_PLAYER_SUCCESS,
  PLAYER_PUSHER_REQUEST,
  PLAYER_CHECK_SUCCESS,
  PLAYER_CHECK,
  PLAYER_CHECK_FAILED,
  GET_HOST_PLAYLIST,
  PLAYER_SCORE,
  PLAYER_SONGS_PLAYED,
} from '../constants/playerConstants'
import { GET_DEMO_DATA } from '../constants/gameConstants'

const initialState = {
  player: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case PLAYER_SONGS_PLAYED:
      return {
        ...state,
        songPlayCount: action.result.songPlayCount,
        getSongCountStatus: true,
        playerSongCount: action.result.playerSongCount,
        pGameRoundCount: action.result.pGameRoundCount,
        pRoundCount: action.result.pRoundCount,
        pGamesPlayed: action.result.pGamesPlayed,
      }
    case PLAYER_SCORE:
      return { ...state, series_data: action.result.series }
    case GET_HOST_PLAYLIST:
      return { ...state, host_playlist: action.result.host_playlist }
    case GET_DEMO_DATA:
      return { ...state, player: action.result.player }
    case PLAYER_PUSHER_REQUEST:
      return { ...state, playerPusherData: action.result, getSongCountStatus: false }
    case PLAYER_CHECK:
      return { ...state, checkingPlayer: true, playerPresent: false }
    case PLAYER_CHECK_SUCCESS:
      return {
        ...state,
        checkingPlayer: false,
        playerPresent: true,
        player: action.result.player,
        introRedeemed: action.result.introRedeemed,
      }
    case PLAYER_CHECK_FAILED:
      return {
        ...state,
        checkingPlayer: false,
        playerPresent: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map(m => m.join(' '))[0]
              .replace('_', ' '),
      }
    case CREATE_PLAYER:
      return { ...state, creatingPlayer: true, playerCreated: false }
    case CREATE_PLAYER_SUCCESS:
      return { ...state, creatingPlayer: false, playerCreated: true, player: action.result.player }
    case CREATE_PLAYER_FAILED:
      return {
        ...state,
        creatingPlayer: false,
        playerCreated: false,
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
