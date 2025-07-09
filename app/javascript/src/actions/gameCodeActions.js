import axios from 'axios'
import { START_GAME_CODE_CHECK, GAME_CODE_CHECK_FAIL, GAME_CODE_CHECK_SUCCESS } from '../constants/gameConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.common['X-CSRF-Token'] = 'x-csrf-token'

export function gameCodeChecking() {
  return {
    type: START_GAME_CODE_CHECK,
  }
}

export function gameCodeCheckingFailed(data) {
  return {
    type: GAME_CODE_CHECK_FAIL,
    result: data,
  }
}

export function gameCodeCheckingSuccess(data) {
  return {
    type: GAME_CODE_CHECK_SUCCESS,
    result: data,
  }
}

export const gameCodeCheck = formParams => {
  return dispatch => {
    dispatch(gameCodeChecking())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/check_game_code', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(gameCodeCheckingSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(gameCodeCheckingFailed(error.response.data))
      })
  }
}
