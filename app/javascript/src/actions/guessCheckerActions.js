import axios from 'axios'
import { PLAYER_GUESS, PLAYER_GUESS_FAILED, PLAYER_GUESS_SUCCESS, RESET_GUESS_DATA } from '../constants/playerConstants'
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.common['X-CSRF-Token'] = 'x-csrf-token'

export function playerGuessing() {
  return {
    type: PLAYER_GUESS,
  }
}

export function playerGuessingFailed(data) {
  return {
    type: PLAYER_GUESS_FAILED,
    result: data,
  }
}

export function playerGuessingSuccess(data) {
  return {
    type: PLAYER_GUESS_SUCCESS,
    result: data,
  }
}

export function resetGuessData() {
  return {
    type: RESET_GUESS_DATA,
  }
}

export const playerGuess = (formParams, callback) => {
  return dispatch => {
    dispatch(playerGuessing())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/guesses', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) {
          dispatch(playerGuessingSuccess(response.data))
          callback && callback(response.data)
        }
      })
      .catch(error => {
        if (error.response) dispatch(playerGuessingFailed(error.response.data))
      })
  }
}

export const resetState = () => {
  return dispatch => {
    dispatch(resetGuessData())
  }
}
