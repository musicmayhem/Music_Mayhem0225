import React, { Component } from 'react'

class SongPicture extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div style={{ background: 'white' }}>
        <div style={{ zIndex: '4', marginTop: '0rem', position: 'relative', top: '-11rem' }}>
          <h1
            style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '100',
              fontSize: '2rem',
              fontStyle: 'italic',
              marginBottom: '0',
            }}
          >
            {this.props.song.name}
          </h1>
          <h2 style={{ fontSize: '1.3rem', margin: '0', color: '#fff' }}>{this.props.song.artist}</h2>
          <h2 style={{ fontSize: '1rem', margin: '0', color: '#fff' }}>({this.props.song.year})</h2>
        </div>
        <div className="dp-container" style={{ marginBottom: '0rem' }}>
          <img
            src={this.props.song.url}
            alt="Thumbnail"
            width="200px"
            height="200px"
            style={{ backgroundColor: 'white', borderRadius: '0px', border: 'none', marginTop: '-4rem' }}
          />
        </div>
      </div>
    )
  }
}

export default SongPicture
