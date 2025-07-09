/* global setTimeout */
import React, { Component } from 'react'
import { Alert } from 'reactstrap'

class Alerter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showAlert: true,
      time: this.props.time || 4000,
    }
  }
  componentDidMount() {
    setTimeout(() => this.setState({ showAlert: false }), this.state.time)
  }
  renderAlert(type, message) {
    switch (type) {
      case 'success':
        return <Alert color="success">{message}</Alert>
      case 'error':
        return <Alert color="danger">{message}</Alert>
    }
  }
  render() {
    return (
      <div>
        {this.state.showAlert && this.renderAlert(this.props.type || 'success', this.props.message || 'Success!')}
      </div>
    )
  }
}

export default Alerter
