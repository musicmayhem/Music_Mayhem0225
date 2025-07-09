import React, { Component } from 'react'

class UserPicture extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    let user = this.props.user
    return (
      <div style={{ background: 'white' }}>
        <div className="dp-container">
          <img
            src={user.avatar}
            alt="Users Profile"
            width="200px"
            height="200px"
            style={{ backgroundColor: 'white' }}
          />
        </div>
        <h3 className="user-name font-light">{user.username}</h3>
      </div>
    )
  }
}

export default UserPicture
