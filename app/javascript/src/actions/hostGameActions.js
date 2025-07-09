/* global document */
import axios from 'axios'
import { reset } from 'redux-form'
import * as constants from '../constants/gameConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function gettingGameData() {
  return {
    type: constants.GET_GAME_DATA,
  }
}

export function gameDataFailed(data) {
  return {
    type: constants.GAME_DATA_FAIL,
    result: data,
  }
}

export function gameDataSuccess(data) {
  return {
    type: constants.GAME_DATA_SUCCESS,
    result: data,
  }
}

export function creatingGame() {
  return {
    type: constants.START_GAME,
  }
}

export function creatingGameFailed(data) {
  return {
    type: constants.GAME_FAIL,
    result: data,
  }
}

export function creatingGameSuccess(data) {
  return {
    type: constants.GAME_SUCCESS,
    result: data,
  }
}

export function sendUpdateGamerequest() {
  return {
    type: constants.UPDATE_REQUEST,
  }
}

export function sendUpdateGamerequestFailed(data) {
  return {
    type: constants.UPDATE_REQUEST_FAIL,
    result: data,
  }
}

export function sendUpdateGamerequestSuccess(data) {
  return {
    type: constants.UPDATE_REQUEST_SUCCESS,
    result: data,
  }
}

export function creatingRound() {
  return {
    type: constants.STARTING_ROUND,
  }
}

export function creatingRoundFailed(data) {
  return {
    type: constants.STARTING_ROUND_FAIL,
    result: data,
  }
}

export function creatingRoundSuccess(data) {
  return {
    type: constants.STARTING_ROUND_SUCCESS,
    result: data,
  }
}

export function loadingSong() {
  return {
    type: constants.LOADING_SONG,
  }
}

export function loadingSongFailed(data) {
  return {
    type: constants.LOADING_SONG_FAIL,
    result: data,
  }
}

export function loadingSongSuccess(data) {
  return {
    type: constants.LOADING_SONG_SUCCESS,
    result: data,
  }
}

export function activeSong() {
  return {
    type: constants.ACTIVE_SONG,
  }
}

export function activeSongFailed(data) {
  return {
    type: constants.ACTIVE_SONG_FAIL,
    result: data,
  }
}

export function activeSongSuccess(data) {
  return {
    type: constants.ACTIVE_SONG_SUCCESS,
    result: data,
  }
}

export function startingNewGame() {
  return {
    type: constants.STARTING_NEW_GAME,
  }
}

export function startingNewGameFailed(data) {
  return {
    type: constants.STARTING_NEW_GAME_FAIL,
    result: data,
  }
}

export function startingNewGameSuccess(data) {
  return {
    type: constants.STARTING_NEW_GAME_SUCCESS,
    result: data,
  }
}

export function gettingGameProfiles() {
  return {
    type: constants.GET_GAME_PROFILES,
  }
}

export function gettingGameProfilesFailed(data) {
  return {
    type: constants.GET_GAME_PROFILES_FAIL,
    result: data,
  }
}

export function gettingGameProfilesSuccess(data) {
  return {
    type: constants.GET_GAME_PROFILES_SUCCESS,
    result: data,
  }
}

export function updatingGame() {
  return {
    type: constants.UPDATING_GAME,
  }
}

export function updatingGameFailed(data) {
  return {
    type: constants.UPDATING_GAME_FAIL,
    result: data,
  }
}

export function updatingGameSuccess(data) {
  return {
    type: constants.UPDATING_GAME_SUCCESS,
    result: data,
  }
}

export function addingNewRound() {
  return {
    type: constants.ADD_NEW_ROUND,
  }
}

export function addingNewRoundFailed(data) {
  return {
    type: constants.ADD_NEW_ROUND_FAIL,
    result: data,
  }
}
export function gettingRemoteData() {
  return {
    type: constants.GETTING_REMOTE_DATA,
  }
}

export function gettingRemoteDataFailed(data) {
  return {
    type: constants.GETTING_REMOTE_DATA_FAIL,
    result: data,
  }
}

export function addingNewRoundSuccess(data) {
  return {
    type: constants.ADD_NEW_ROUND_SUCCESS,
    result: data,
  }
}

export function gettingRemoteDataSuccess(data) {
  return {
    type: constants.GETTING_REMOTE_DATA_SUCCESS,
    result: data,
  }
}

export function gettingOpenSessionsList() {
  return {
    type: constants.GET_OPEN_SESSION_LIST,
  }
}

export function openSessionsListFailed(data) {
  return {
    type: constants.GET_OPEN_SESSION_LIST_FAIL,
    result: data,
  }
}

export function skippingSong(data) {
  return {
    type: constants.SKIP_SONG,
    result: data,
  }
}

export function openSessionsListSuccess(data) {
  return {
    type: constants.GET_OPEN_SESSION_LIST_SUCCESS,
    result: data,
  }
}

export function skippingSongSuccess(data) {
  return {
    type: constants.SKIP_SONG_SUCCESS,
    result: data,
  }
}

export function gettingOpenSeriesList() {
  return {
    type: constants.GET_OPEN_SERIES_LIST,
  }
}

export function openSeriesListFailed(data) {
  return {
    type: constants.GET_OPEN_SERIES_LIST_FAIL,
    result: data,
  }
}

export function openSeriesListSuccess(data) {
  return {
    type: constants.GET_OPEN_SERIES_LIST_SUCCESS,
    result: data,
  }
}
export function resetGameConfiguration() {
  return {
    type: constants.RESET_GAME_CONFIGURATION,
  }
}

export function resettingGame() {
  return {
    type: constants.RESET_GAME_DATA,
  }
}

export const createGame = formParams => {
  return dispatch => {
    dispatch(creatingGame())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.data) {
          dispatch(reset(formParams.formName))
          dispatch(creatingGameSuccess(response.data))
        }
      })
      .catch(error => {
        if (error.response) dispatch(creatingGameFailed(error.response.data))
      })
  }
}

export const updateGameRequest = updateParams => {
  return dispatch => {
    dispatch(sendUpdateGamerequest())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/update_state', updateParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(sendUpdateGamerequestSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(sendUpdateGamerequestFailed(error.response.data))
      })
  }
}

export const startingRoundServer = params => {
  return dispatch => {
    dispatch(creatingRound())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/current_round', params)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(creatingRoundSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(creatingRoundFailed(error.response.data))
      })
  }
}

export const loadSong = params => {
  return dispatch => {
    dispatch(loadingSong())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/song_loaded', params)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(loadingSongSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(loadingSongFailed(error.response.data))
      })
  }
}

export const setActiveSong = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/games/active_song', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
    })
  }
}

export const getGameData = params => {
  return dispatch => {
    dispatch(gettingGameData())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/get_game_data', params)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(gameDataSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(gameDataFailed(error.response.data))
      })
  }
}

export const startNewGame = params => {
  return dispatch => {
    dispatch(startingNewGame())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/start_new_game', params)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(startingNewGameSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(startingNewGameFailed(error.response.data))
      })
  }
}

export const updateGame = formParams => {
  return dispatch => {
    dispatch(updatingGame())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/game_configurations_update', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.data) dispatch(updatingGameSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(updatingGameFailed(error.response.data))
      })
  }
}

export const getLeaderBoards = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/games/get_leaderboard_data', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) return response.data
      else return false
    })
  }
}

export const addNewRound = formParams => {
  return dispatch => {
    dispatch(addingNewRound())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/add_new_round', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.data) dispatch(addingNewRoundSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(addingNewRoundFailed(error.response.data))
      })
  }
}

export const clearState = () => {
  return dispatch => {
    dispatch(resetGameConfiguration())
  }
}

export const getRemoteData = params => {
  return dispatch => {
    dispatch(gettingRemoteData())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/games/get_remote_data', params)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(gettingRemoteDataSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(gettingRemoteDataFailed(error.response.data))
      })
  }
}

export const sendVolumePusherRequest = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/games/game_volume_request', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) return true
      else return false
    })
  }
}

export const advanceSongInGame = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/games/advance_song_in_game', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) return true
      else return false
    })
  }
}

export const skipAndAddSongCurrentGame = params => {
  return dispatch => {
    dispatch(skippingSong())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/games/skip_and_add_song_current_game', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) dispatch(skippingSongSuccess(response.data))
    })
  }
}

export const resetGameData = () => {
  return dispatch => {
    dispatch(resettingGame())
  }
}
