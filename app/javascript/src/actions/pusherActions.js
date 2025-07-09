import axios from 'axios'
import { UPDATE_PUSHER_REQUEST } from '../constants/pusherConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function updatingPusher(data) {
  return {
    type: UPDATE_PUSHER_REQUEST,
    result: data,
  }
}

export const updatePusherRequest = params => {
  return dispatch => {
    dispatch(updatingPusher(params))
  }
}
