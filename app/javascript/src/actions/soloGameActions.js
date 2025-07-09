import axios from 'axios'
import { START_SOLO_GAME, SOLO_GAME_FAIL, SOLO_GAME_SUCCESS } from '../constants/gameConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.common['X-CSRF-Token'] = 'x-csrf-token'

export function startingSoloGame() {
  return {
    type: START_SOLO_GAME,
  }
}

export function startingSoloGameFailed(data) {
  return {
    type: SOLO_GAME_FAIL,
    result: data,
  }
}

export function startingSoloGameSuccess(data) {
  return {
    type: SOLO_GAME_SUCCESS,
    result: data,
  }
}

export const startSoloGame = formParams => {
  return dispatch => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    dispatch(startingSoloGame())
    return axios
      .post('/api/v1/games/solo', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(startingSoloGameSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(startingSoloGameFailed(error.response.data))
      })
  }
}
