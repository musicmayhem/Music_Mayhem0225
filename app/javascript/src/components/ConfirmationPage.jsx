/* global window URL */
import React from 'react'
import { deviseRequest } from '../actions/gameAction'
import { CONFIRMATION_SUCCESS } from '../constants/authConstants'
import { connect } from 'react-redux'
import Swal from 'sweetalert2'

let code = ''
class ConfirmationPage extends React.Component {
  UNSAFE_componentWillMount() {
    var url_string = window.location.href
    var url = new URL(url_string)
    if (url) {
      var c_token = url.searchParams.get('confirmation_token') || url.searchParams.get('amp;confirmation_token')
      code = url.searchParams.get('code')
      this.props.dispatch(
        deviseRequest('/accounts/confirmation?confirmation_token=' + c_token, { type: CONFIRMATION_SUCCESS })
      )
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.auth && nextProps.auth.confirmed) {
      Swal.fire({
        type: 'success',
        title: 'Your have successfully confirmed your account!',
        showConfirmButton: false,
        timer: 1500,
      })
      if (code) this.props.history.push('/accounts/setting?focus=true&&code=' + code)
      else this.props.history.push('/accounts/setting?focus=true')
    }
    if (nextProps.auth && nextProps.auth.errors) {
      Swal.fire({
        type: 'error',
        title: `${nextProps.auth.errors}`,
        showConfirmButton: false,
        timer: 3000,
      })
      this.props.history.push('/')
    }
  }

  render() {
    return <div />
  }
}

function mapStateToProps(store) {
  return {
    auth: store.auth,
  }
}

export default connect(mapStateToProps)(ConfirmationPage)
