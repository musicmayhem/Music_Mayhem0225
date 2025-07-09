import React, { Component } from 'react'

export default class HeaderLoader extends Component {
  render() {
    return (
      <div>
        <div className="header-progress-container">
          <div className="header-progress" style={{ width: this.props.completed + '%' }} />
          <h4 style={{ color: '#321b47'}}>
            <i className="fa fa-clock-o" /> {this.props.msg}
          </h4>
        </div>
      </div>
    )
  }
}
