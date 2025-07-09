/* global document */
import axios from 'axios'
import {
  CREATE_PLAYER,
  CREATE_PLAYER_FAILED,
  CREATE_PLAYER_SUCCESS,
  PLAYER_PUSHER_REQUEST,
  PLAYER_CHECK_SUCCESS,
  PLAYER_CHECK,
  PLAYER_CHECK_FAILED,
} from '../constants/playerConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function playerCreating() {
  return {
    type: CREATE_PLAYER,
  }
}

export function playerCreationFailed(data) {
  return {
    type: CREATE_PLAYER_FAILED,
    result: data,
  }
}

export function playerCreationSuccess(data) {
  return {
    type: CREATE_PLAYER_SUCCESS,
    result: data,
  }
}

export function checkingPlayer() {
  return {
    type: PLAYER_CHECK,
  }
}

export function checkingPlayerFailed(data) {
  return {
    type: PLAYER_CHECK_FAILED,
    result: data,
  }
}

export function checkingPlayerSuccess(data) {
  return {
    type: PLAYER_CHECK_SUCCESS,
    result: data,
  }
}

export function updatingPlayerPusher(data) {
  return {
    type: PLAYER_PUSHER_REQUEST,
    result: data,
  }
}

export const updatePlayerPusherRequest = params => {
  return dispatch => {
    dispatch(updatingPlayerPusher(params))
  }
}

export const createPlayer = formParams => {
  return dispatch => {
    dispatch(playerCreating())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/player', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(playerCreationSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(playerCreationFailed(error.response.data))
      })
  }
}

export const checkPlayerPresent = params => {
  return dispatch => {
    dispatch(checkingPlayer())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/player/check_player_present', params)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) {
          dispatch(checkingPlayerSuccess(response.data))
          return response.data
        } else {
          return false
        }
      })
      .catch(error => {
        if (error.response) dispatch(checkingPlayerFailed(error.response.data))
      })
  }
}

export const checkPlayerPresentInLastGame = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/player/check_player_present_in_last_game', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) return response.data
      else return false
    })
  }
}

export const checkPlayerName = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/player/check_player_name', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) return response.data
      else return false
    })
  }
}
