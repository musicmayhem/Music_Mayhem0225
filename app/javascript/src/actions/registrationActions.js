import axios from 'axios'
import { CREATION_SUCCESS, CREATION_FAIL, START_CREATION } from '../constants/authConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function userCreating() {
  return {
    type: START_CREATION,
  }
}

export function userCreationFailed(data) {
  return {
    type: CREATION_FAIL,
    result: data,
  }
}

export function userCreationSuccess(data) {
  return {
    type: CREATION_SUCCESS,
    result: data,
  }
}

export const createUser = formParams => {
  return dispatch => {
    dispatch(userCreating())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/accounts', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.status == 201) dispatch(userCreationSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(userCreationFailed(error.response.data))
      })
  }
}

export const createGuestUser = formParams => {
  return dispatch => {
    dispatch(userCreating())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/guestusers', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.data) dispatch(userCreationSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(userCreationFailed(error.response.data))
      })
  }
}
