import {
  START_LOGIN,
  LOGIN_FAIL,
  CONFIRMATION_SUCCESS,
  LOGIN_SUCCESS,
  LOGOUT_SUCCESS,
  START_CREATION,
  CREATION_SUCCESS,
  CREATION_FAIL,
  START_CHECK,
  CHECK_LOGIN_FAIL,
  CHECK_LOGIN_SUCCESS,
  RESEND_EMAIL_CONFIRMATION,
  START_CONFIRM_OTP,
  CONFIRM_OTP,
  FAILED_CONFIRM_OTP,
} from "../constants/authConstants";
import { GUEST_NAME } from "../constants/playerConstants";

const initialState = {
  message: null,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GUEST_NAME:
      return { ...state, name: action.result.guestName };
    case RESEND_EMAIL_CONFIRMATION:
      return { ...state, confirmation_status: action.result.player };
    case CONFIRMATION_SUCCESS:
      if (
        action.result.confirmation &&
        Object.keys(action.result.confirmation).length > 0
      ) {
        return { ...state, confirmed: action.result.confirmation };
      } else {
        return {
          ...state,
          errors: action.result.error
            ? Object.entries(action.result.error)
                .map((m) => m.join(" "))[0]
                .replace("_", " ")
            : 0,
        };
      }
    case START_LOGIN:
      return { loggingIn: true, loggedIn: false };
    case LOGIN_SUCCESS:
      return {
        loggingIn: false,
        loggedIn: true,
        accountLoggedIn: true,
        data: action.result,
        currentAccount: action.result,
      };
    case LOGIN_FAIL:
      return {
        loggingIn: false,
        loggedIn: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map((m) => m.join(" "))[0]
              .replace("_", " "),
      };
    case LOGOUT_SUCCESS:
      return {
        loggingIn: false,
        loggedIn: false,
        currentAccount: false,
        message: "Signed out successfully",
      };
    case START_CREATION:
      return { creatingAccount: true, created: false };
    case CREATION_SUCCESS:
      return { creatingAccount: false, created: true, data: action.result };
    case CREATION_FAIL:
      return {
        creatingAccount: false,
        created: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map((m) => m.join(" "))[0]
              .replace("_", " "),
      };
    case START_CHECK:
      return { ...state, checkingLogin: true, accountLoggedIn: false };
    case CHECK_LOGIN_SUCCESS:
      return {
        ...state,
        checkingLogin: false,
        accountLoggedIn: true,
        currentAccount: action.result.account,
      };
    case CHECK_LOGIN_FAIL:
      return {
        ...state,
        checkingLogin: false,
        accountLoggedIn: false,
        errors: action.result.error
          ? action.result.error
          : Object.entries(action.result.errors)
              .map((m) => m.join(" "))[0]
              .replace("_", " "),
      };
    case CONFIRM_OTP:
      return {
        ...state,
        verifyingOTP: false,
        optVerified: true,
        accountLoggedIn: true,
        otpVerificationFailed: false,
        currentAccount: action.result.account,
      };

    case START_CONFIRM_OTP:
      return {
        ...state,
        verifyingOTP: true,
        otpVerified: false,
        otpVerificationFailed: false,
      };

    case FAILED_CONFIRM_OTP:
      return {
        ...state,
        verifyingOTP: false,
        optVerified: false,
        otpVerificationFailed: true,
        errors: action.result.error ? action.result.error : "Invalid OTP",
      };

    default:
      return state;
  }
}
