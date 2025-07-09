import {
  CHANGING_PASSWORD,
  CHANGING_PASSWORD_FAIL,
  CHANGING_PASSWORD_SUCCESS,
  SEND_RESET_PASSWORD_MAIL,
  SEND_RESET_PASSWORD_MAIL_FAILED,
  SEND_RESET_PASSWORD_MAIL_SUCCESS,
} from '../constants/authConstants'
const initialState = {
  message: null,
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CHANGING_PASSWORD:
      return { ...state, changingPassword: true, passwordChanged: false }
    case CHANGING_PASSWORD_SUCCESS:
      return { ...state, changingPassword: false, passwordChanged: true, success: action.result }
    case CHANGING_PASSWORD_FAIL:
      return {
        ...state,
        changingPassword: false,
        passwordChanged: false,
        errors:
          typeof action.result.errors === 'string'
            ? action.result.errors
            : Object.entries(action.result.errors)
                .map(m => m.join(' '))[0]
                .replace('_', ' '),
      }
    case SEND_RESET_PASSWORD_MAIL:
      return {
        ...state,
        sending_password_reset_mail: true,
        password_reset_mail_send: false,
        errors: null,
        data_send: null,
      }
    case SEND_RESET_PASSWORD_MAIL_SUCCESS:
      return { ...state, sending_password_reset_mail: false, password_reset_mail_send: true, data_send: action.result }
    case SEND_RESET_PASSWORD_MAIL_FAILED:
      return {
        ...state,
        sending_password_reset_mail: false,
        password_reset_mail_send: false,
        errors: Object.entries(action.result.errors)
          .map(m => m.join(' '))[0]
          .replace('_', ' '),
      }
    default:
      return state
  }
}
