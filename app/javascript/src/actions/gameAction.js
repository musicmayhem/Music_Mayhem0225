import axios from 'axios'
import { GETTING_DATA, POSTING, GETTING_FAILED } from '../constants/routeConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function gettingData() {
  return {
    type: GETTING_DATA,
  }
}

export function getCompleted(type, data) {
  return {
    type: type,
    result: data,
  }
}

export function gettingDataFailed(status, data) {
  return {
    type: GETTING_FAILED,
    result: data && data.error,
  }
}

export const makeRequest = (path, params) => {
  return dispatch => {
    dispatch(gettingData())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    axios
      .get('/api/v1/' + path)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        dispatch(getCompleted(params.type, response.data))
      })
      .catch(error => {
        if (error.response) dispatch(gettingDataFailed(error.response.data))
      })
  }
}

export function posting(type) {
  return {
    type: type,
  }
}

export function posted(type, data) {
  return {
    type: type,
    result: data,
  }
}

export function postFailed(type, data) {
  return {
    type: type,
    result: data,
  }
}

export const postRequest = (path, params, data) => {
  return dispatch => {
    if (data) dispatch(posting(POSTING))
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    axios
      .post('/api/v1/' + path, params.values)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        dispatch(posted(params.type, response.data))
      })
      .catch(error => {
        if (error.response) dispatch(postFailed(error.response.data))
      })
  }
}

export const instantRequest = (path, params) => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/' + path, params.values)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) return response.data
        else return false
      })
      .catch(error => {
        if (error.response) console.log(error)
      })
  }
}

export const deviseRequest = (path, params) => {
  return dispatch => {
    dispatch(gettingData())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    axios
      .get(path)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        dispatch(getCompleted(params.type, response.data))
      })
      .catch(error => {
        if (error.response) dispatch(gettingDataFailed(error.response.data))
      })
  }
}

export const gamePlayers = params => {
  return () => {
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios.post('/api/v1/games/game_players', params).then(response => {
      axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
      if (response.data) return response.data
      else return false
    })
  }
}

export const getDefaultTime = () => {
  var todayDate = new Date()
  var getTodayDate = todayDate.getDate() + 1 < 10 ? '0' + todayDate.getDate() : todayDate.getDate()
  var getTodayMonth = todayDate.getMonth() + 1 < 10 ? '0' + Number(todayDate.getMonth() + 1) : todayDate.getMonth() + 1
  var getCurrentDateTime = String(getTodayMonth) + String(getTodayDate)
  return getCurrentDateTime
}

export function patching(type) {
  return {
    type: type,
  }
}

export function patched(type, data) {
  return {
    type: type,
    result: data,
  }
}

export function patchFailed(type, data) {
  return {
    type: type,
    result: data,
  }
}
