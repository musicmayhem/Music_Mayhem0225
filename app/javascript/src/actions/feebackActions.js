import axios from 'axios'
import { SENDING_FEEDBACK_SUCCESS, SENDING_FEEDBACK_FAIL, SENDING_FEEDBACK } from '../constants/feedbackConstants'

axios.defaults.headers.post['Content-Type'] = 'application/json'

export function sendFeedback() {
  return {
    type: SENDING_FEEDBACK,
  }
}

export function sendFeedbackFailed(data) {
  return {
    type: SENDING_FEEDBACK_FAIL,
    result: data,
  }
}

export function sendFeedbackSuccess(data) {
  return {
    type: SENDING_FEEDBACK_SUCCESS,
    result: data,
  }
}

export const sendingFeedback = formParams => {
  return dispatch => {
    dispatch(sendFeedback())
    axios.defaults.headers.common['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').content
    return axios
      .post('/api/v1/pages/feedback', formParams)
      .then(response => {
        axios.defaults.headers.common['X-CSRF-Token'] = response.headers['csrf-token']
        if (response.data) dispatch(sendFeedbackSuccess(response.data))
      })
      .catch(error => {
        if (error.response) dispatch(sendFeedbackFailed(error.response.data))
      })
  }
}
