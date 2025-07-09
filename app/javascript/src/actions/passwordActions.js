/* global document */
import {
  CHANGING_PASSWORD,
  CHANGING_PASSWORD_FAIL,
  CHANGING_PASSWORD_SUCCESS,
  SEND_RESET_PASSWORD_MAIL,
  SEND_RESET_PASSWORD_MAIL_FAILED,
  SEND_RESET_PASSWORD_MAIL_SUCCESS,
} from '../constants/authConstants'
import axios from 'axios'
import { reset } from 'redux-form'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function changingPassword() {
  return {
    type: CHANGING_PASSWORD,
  }
}

export function changingPasswordFailed(data) {
  return {
    type: CHANGING_PASSWORD_FAIL,
    result: data,
  }
}

export function changingPasswordSuccess(data) {
  return {
    type: CHANGING_PASSWORD_SUCCESS,
    result: data,
  }
}

export function sendingPasswordEmail() {
  return {
    type: SEND_RESET_PASSWORD_MAIL,
  }
}

export function sendingPasswordEmailFailed(data) {
  return {
    type: SEND_RESET_PASSWORD_MAIL_FAILED,
    result: data,
  }
}

export function sendingPasswordEmailSuccess(data) {
  return {
    type: SEND_RESET_PASSWORD_MAIL_SUCCESS,
    result: data,
  }
}

export const changePassword = formParams => {
  return dispatch => {
    dispatch(changingPassword())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .put('/accounts/password', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.status == 204) dispatch(changingPasswordSuccess(response.status))
      })
      .catch(error => {
        if (error.response) dispatch(sendingPasswordEmailFailed(error.response.data))
      })
  }
}
export const resendPasswordInstruction = formParams => {
  return dispatch => {
    dispatch(sendingPasswordEmail())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/accounts/password', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.status == 201) {
          dispatch(reset(formParams.formName))
          dispatch(sendingPasswordEmailSuccess(response.status))
        }
      })
      .catch(error => {
        if (error.response) dispatch(sendingPasswordEmailFailed(error.response.data))
      })
  }
}
