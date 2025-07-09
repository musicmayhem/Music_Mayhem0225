import {
  UPDATE_SUCCESS,
  UPDATE_FAIL,
  START_UPDATE,
  REWARDS,
  WINNER_TICKET,
  TICKETS,
  SENDING_REWARDS,
  REDEEM_PICK,
  UNMUTE,
  REDEEM_SPIFF,
  REDEEM_INDEX_SPIFF,
} from '../constants/accountConstants'

const initialState = {
  message: null,
  pickRedeemed: 0,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case REDEEM_INDEX_SPIFF:
      return { ...state, spiffRedeemed: action.result.spiffRedeemed, spiffs: action.result.spiffs }
    case UNMUTE:
      return { ...state, status: action.result.status }
    case REDEEM_SPIFF:
      return {
        ...state,
        spiffsCount: action.result.spiffsCount,
      }
    case REDEEM_PICK:
      return {
        ...state,
        picks: action.result.picks,
        pickRedeemed: action.result.pickRedeemed,
        lastPickRedeemed: action.result.lastPickRedeemed,
        pickRedeemedPreviously: action.result.pickRedeemedPreviously,
        tickets: action.result.tickets,
      }
    case SENDING_REWARDS:
      return { ...state, giftStatus: action.result.status, pickRedeemed: 0 }
    case TICKETS:
      return { ...state, lastTicket: action.result.lastTicket, winner: null }
    case REWARDS:
      return {
        ...state,
        status: action.result.status,
        tickets: action.result.tickets,
        picks: action.result.picks,
        picksCount: action.result.picksCount,
        pickRedeemed: 0,
        lastPickRedeemed: null,
        spiffs: action.result.spiffs,
        spiffsCount: action.result.spiffsCount,
      }
    case WINNER_TICKET:
      return { ...state, winner: action.result.winner }
    case START_UPDATE:
      return { ...state, accountUpdating: true, accountUpdated: false }
    case UPDATE_SUCCESS:
      return { ...state, accountUpdating: false, accountUpdated: true }
    case UPDATE_FAIL:
      return {
        ...state,
        accountUpdating: false,
        accountUpdated: false,
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
