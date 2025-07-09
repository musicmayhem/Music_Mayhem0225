/* global document */
import axios from 'axios'
import {
  START_LOGIN,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  START_CHECK,
  CHECK_LOGIN_FAIL,
  CHECK_LOGIN_SUCCESS,
} from '../constants/authConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function userIsLogging() {
  return {
    type: START_LOGIN,
  }
}

export function userLogInFailed(data) {
  return {
    type: LOGIN_FAIL,
    result: data,
  }
}

export function userLogInSuccess(data) {
  return {
    type: LOGIN_SUCCESS,
    result: data,
  }
}

export function checkAccountLogin() {
  return {
    type: START_CHECK,
  }
}

export function checkAccountLoginFailed(data) {
  return {
    type: CHECK_LOGIN_FAIL,
    result: data,
  }
}

export function checkAccountLoginSuccess(data) {
  return {
    type: CHECK_LOGIN_SUCCESS,
    result: data,
  }
}

export function logOutSuccess() {
  return {
    type: LOGOUT_SUCCESS,
  }
}

export const logInUser = formParams => {
  return dispatch => {
    dispatch(userIsLogging())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/accounts/sign_in', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(userLogInSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(userLogInFailed(error.response.data))
      })
  }
}

export const logoutUser = () => {
  return dispatch => {
    return axios.get('/accounts/sign_out').then(response => {
      document.querySelector('meta[name="csrf-token"]').content = response.headers['csrf-token']
      dispatch(logOutSuccess())
    })
  }
}

export const checkUserIsLogin = () => {
  return dispatch => {
    dispatch(checkAccountLogin())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .get('/api/v1/games/authenticate_users')
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data.account) {
          dispatch(checkAccountLoginSuccess(response.data))
          return response.data
        } else {
          return false
        }
      })
      .catch(error => {
        if (error.response) dispatch(checkAccountLoginFailed(error.response.data))
      })
  }
}
