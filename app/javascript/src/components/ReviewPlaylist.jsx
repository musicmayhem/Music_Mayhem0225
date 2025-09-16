import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import Sortable from 'sortablejs'
import Swal from 'sweetalert2'

class ReviewPlaylist extends React.Component {

  state={
    songsData: null,
  }

  UNSAFE_componentWillMount() {
    this.setState( { songsData: this.props.songsData } )
    if(!this.props.skip)
      Swal.fire({
        type: 'warning',
        title: 'Skip Not Availalble',
        text: 'No more songs left in playlist',
        showConfirmButton: false,
        timer: 1500,
      })
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if(this.state.songsData != nextProps.songsData){
      var songArray = this.state.songsData
      let newSong = nextProps.songsData[nextProps.songsData.length -1]
      var i, unmatched = true
      for (i=0; i<songArray.length; i++)
        if(songArray[i].id == newSong.id){
          unmatched=false
          break
        }
      if(unmatched){
        songArray[this._oldSongIndex] = newSong
        this.setState({ songsData: songArray })
      }
    }
    if(this.props.skip && !nextProps.skip && this._runOnce){
      this._runOnce = false
      Swal.fire({
        type: 'warning',
        title: 'No more songs to skip',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  _runOnce = true
  _oldSongIndex = null

  componentDidMount(){
    var el = document.getElementById('items')
    var sortable = Sortable.create(el,{
      animation: 150,
      fallbackTolerance: 10,
      onEnd: (evt) => {
        this.reOrderSongs(evt)
      },
    })
  }

  reOrderSongs(evt){
    var songArray = this.state.songsData
    var i = 0
    var temp = null
    if(evt.newIndex > evt.oldIndex){
      temp = songArray[evt.oldIndex]
      for(i= evt.oldIndex; i < evt.newIndex; i++){
        songArray[i]=songArray[i+1]
      }
      songArray[evt.newIndex] = temp
      this.setState({ songsdata: songArray})
    }
    if(evt.newIndex < evt.oldIndex){
      temp = songArray[evt.oldIndex]
      for(i= evt.oldIndex; i > evt.newIndex; i--){
        songArray[i]=songArray[i-1]
      }
      songArray[evt.newIndex] = temp
      this.setState({ songsdata: songArray})
    }
  }

  render() {
    const { totalSongCount, skip } = this.props
    const { songsData } = this.state
    return (
      <div>
        <Row>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h5 style={{ fontWeight: 'bold' }}>All Songs Info</h5>
          </div>
          <Col xs={12} id='items' >
            {songsData.map((x, i) => (
              <div key={x.id} data={x.id} className="song-info-css song-info-config">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <b>
                    Song{' '}
                    {i + 1 + (totalSongCount - songsData.length) + '/' + totalSongCount}{' '}
                    Info
                  </b>
                  {skip &&(
                    <b
                      style={{ textDecoration: 'underline' }}
                      onClick={() => {
                        this._oldSongIndex = i
                        this.props.skipSelectedSong(x.id)
                      }}
                      >
                        Skip
                    </b>
                  )}
                </div>
                <b>
                {x.title}
                </b> by{' '}
                <b>
                {x.artist}
                </b> (
                {x.year}
                )
              </div>
            ))}
          </Col>
        </Row>
      </div>
    )
  }
}

export default ReviewPlaylist
