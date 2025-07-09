import { SENDING_FEEDBACK_SUCCESS, SENDING_FEEDBACK_FAIL, SENDING_FEEDBACK } from '../constants/feedbackConstants'

const initialState = {
  message: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SENDING_FEEDBACK:
      return { ...state, sendingFeedback: true, feedbackSend: false }
    case SENDING_FEEDBACK_SUCCESS:
      return { ...state, sendingFeedback: false, feedbackSend: true }
    case SENDING_FEEDBACK_FAIL:
      return { ...state, sendingFeedback: false, feedbackSend: false }
    default:
      return state
  }
}
