import React, { Component } from 'react'
import Swal from 'sweetalert2'
import { FormGroup, Label, Input, FormFeedback, Container, Row, Col, Button } from 'reactstrap'

class PlaylistFilter extends Component {

 UNSAFE_componentWillMount() {
  if(!this.props.filteredSongCount) this.getFilteredSongCount([],[])
 }

  saveFilter(filterType, filter, toggle){
    var eras = this.props.playlistEras
    var genres = this.props.playlistGenres
    if(filterType == 'era'){
      if(toggle) eras.push(filter)
      else eras.splice( eras.indexOf(filter), 1 )
    }
    if(filterType == 'genre'){
      if(toggle) genres.push(filter)
      else genres.splice( genres.indexOf(filter), 1 )
    }
    this.props.setEras(eras)
    this.props.setGenres(genres)
    this.getFilteredSongCount(eras, genres)
  }

  getFilteredSongCount(eras, genres) {
    this.props
      .instantRequest('games/get_filtered_song_count', {
        values: {
          playlist_id: this.props.playlist_id,
          game: { code: this.props.match.params.game_code },
          eras: eras,
          genres: genres
        },
      })
      .then(res => {
        if (res) this.props.setFitererdSongCount(res.count.toString())
      })
  }


  render() {
    const { selectedPlaylist, playlistData, playlistEras, playlistGenres, filteredSongCount } = this.props
    return (
      <div>
        <Row xs={12}>
          <Col xs={12}>
            <h4 style={{ fontWeight: '600', color: '#dc3591', backgroundColor: '#c4ffde' }}>ERAS</h4>
          </Col>
        </Row>
        <Row xs={12}>
          <Col xs={12}>
            {playlistData &&
             playlistData[selectedPlaylist] &&
             playlistData[selectedPlaylist].eras.length > 0 &&
             playlistData[selectedPlaylist].eras.sort().map((x, i) => (
                 <div key={x[0]} style={{ textAlign: 'left', display: 'inline-block'}}>
                   <Button
                     className="filter-toggle-button"
                     onClick={ toggle => this.saveFilter('era',x[0], !playlistEras.includes(x[0]))}
                     style={{ backgroundColor: playlistEras.includes(x[0]) ? '#2cbe4e' : ''}}
                     >
                     {x[0]+' '}({x[1]})
                   </Button>
                 </div>
             ))}
           </Col>
        </Row>
        <Row xs={12}>
          <Col xs={12} style={{ marginTop: '10px'}} >
            <h4 style={{ fontWeight: '600', color: '#dc3591', backgroundColor: '#c4ffde' }}>GENRES</h4>
          </Col>
        </Row>
        <Row xs={12}>
          <Col xs={12}>
            {playlistData &&
             playlistData[selectedPlaylist] &&
             playlistData[selectedPlaylist].genres.length > 0 &&
             playlistData[selectedPlaylist].genres.sort().map((x, i) => (
               <div key={x[0]} style={{ textAlign: 'left', display: 'inline-block'}} >
                 <Button
                   className="filter-toggle-button"
                   onClick={ toggle => this.saveFilter('genre',x[0], !playlistGenres.includes(x[0]))}
                   style={{ backgroundColor: playlistGenres.includes(x[0]) ? '#2cbe4e' : '' }}
                   >
                   {x[0]+' '}({x[1]})
                 </Button>
               </div>
             ))}
           </Col>
        </Row>
        <Row>
         <Col sm="12">
           {filteredSongCount && (
           <div>
             <h4 style={{ fontWeight: '600', textAlign: 'left', color: filteredSongCount == '0' ? 'red' : '#2cbe4e' }}>{filteredSongCount} {filteredSongCount == '1' ? 'song' : 'songs'} Found</h4>
           </div>)}
         </Col>
       </Row>
       <Row>
         <Col sm="12">
          <button className="mayhem-btn-blue btn-full-width"
            style={{marginTop: '10px'}}
            onClick={()=> {
              if(parseInt(filteredSongCount))
                this.props.filterPlaylistModal(false)
              else
              Swal.fire({
                type: 'warning',
                title: 'You cannot proceed with 0 songs',
                showConfirmButton: false,
                timer: 1500,
              })
            }}
            >
            SAVE
          </button>
         </Col>
       </Row>
      </div>
    )
  }
}


export default PlaylistFilter
