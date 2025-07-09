/*global document */
import axios from "axios";
import {
  UPDATE_SUCCESS,
  UPDATE_FAIL,
  START_UPDATE,
} from "../constants/accountConstants";

import {
  START_CONFIRM_OTP,
  CONFIRM_OTP,
  FAILED_CONFIRM_OTP,
} from "../constants/authConstants";

axios.defaults.headers.post["Content-Type"] = "application/json";
export function accountUpdating() {
  return {
    type: START_UPDATE,
  };
}

export function accountUpdationFailed(data) {
  return {
    type: UPDATE_FAIL,
    result: data,
  };
}

export function accountUpdationSuccess(data) {
  return {
    type: UPDATE_SUCCESS,
    result: data,
  };
}

export const accountUpdate = (formParams) => {
  if (formParams.account && formParams.account.logo) {
    const formData = new FormData();
    const newParams = Object.keys(formParams.account).map((l) =>
      formData.append(`account[${l}]`, formParams.account[l])
    );
    formData.append("account[logo]", formParams.account.logo[0]);
    return (dispatch) => {
      dispatch(accountUpdating());
      axios.defaults.headers.common["X-CSRF-Token"] = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;
      return axios
        .patch("/accounts", formData)
        .then((response) => {
          axios.defaults.headers.common["X-CSRF-Token"] =
            response.headers["csrf-token"];
          if (response.data) dispatch(accountUpdationSuccess(response.data));
        })
        .catch((error) => {
          if (error.response)
            dispatch(accountUpdationFailed(error.response.data));
        });
    };
  } else {
    return (dispatch) => {
      dispatch(accountUpdating());
      axios.defaults.headers.common["X-CSRF-Token"] = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;
      return axios
        .patch("/accounts", formParams)
        .then((response) => {
          axios.defaults.headers.common["X-CSRF-Token"] =
            response.headers["csrf-token"];
          if (response.data) dispatch(accountUpdationSuccess(response.data));
        })
        .catch((error) => {
          if (error.response)
            dispatch(accountUpdationFailed(error.response.data));
        });
    };
  }
};

export function verifyOTPstart() {
  return {
    type: START_CONFIRM_OTP,
  };
}

export function verifyOTPFailed(data) {
  return {
    type: FAILED_CONFIRM_OTP,
    result: data,
  };
}

export function verifyOTPSuccess(data) {
  return {
    type: CONFIRM_OTP,
    result: data,
  };
}
export const confirmOtp = (formParams) => {
  if (formParams.otp && formParams.email) {
    return (dispatch) => {
      dispatch(verifyOTPstart());
      axios.defaults.headers.common["X-CSRF-Token"] = document.querySelector(
        'meta[name="csrf-token"]'
      ).content;

      return axios
        .post("/api/v1/player/verify_otp", formParams)
        .then((response) => {
          axios.defaults.headers.common["X-CSRF-Token"] =
            response.headers["csrf-token"];
          if (response.data) dispatch(verifyOTPSuccess(response.data));
        })
        .catch((error) => {
          if (error.response) dispatch(verifyOTPFailed(error.response.data));
        });
    };
  }
};
