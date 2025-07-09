import {
  INDEX_LOADING,
  INDEX_FAIL,
  INDEX_SUCCESS,
  INVITATION_SUCCESS,
  INVITATION_FAIL,
  INVITATION_SENDING,
} from '../constants/indexConstants'

import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function indexIsLoading() {
  return {
    type: INDEX_LOADING,
  }
}

export function indexLoadFailed(data) {
  return {
    type: INDEX_FAIL,
    result: data,
  }
}

export function indexLoadSuccess(data) {
  return {
    type: INDEX_SUCCESS,
    result: data,
  }
}

export function invitationSending() {
  return {
    type: INVITATION_SENDING,
  }
}

export function invitationSendingFailed(data) {
  return {
    type: INVITATION_FAIL,
    result: data,
  }
}

export function invitationSendingSuccess(data) {
  return {
    type: INVITATION_SUCCESS,
    result: data,
  }
}

export const userDashboard = () => {
  return dispatch => {
    dispatch(indexIsLoading())
    return axios
      .get('/api/v1/games')
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.data) dispatch(indexLoadSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(indexLoadFailed(error.response.data))
      })
  }
}

export const inviteUser = formParams => {
  const acc =
    formParams.accounts && formParams.accounts.length > 0
      ? formParams.account.concat(formParams.accounts)
      : formParams.account
  return dispatch => {
    dispatch(invitationSending())
    return axios
      .post('/account_invite', { account: acc })
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['x-csrf-token']
        if (response.data) dispatch(invitationSendingSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(invitationSendingFailed(error.response.data))
      })
  }
}
