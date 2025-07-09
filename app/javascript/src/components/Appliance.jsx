/* global URL window */
import React from 'react'
import { connect } from 'react-redux'
import { postRequest } from '../actions/gameAction'
import { checkUserIsLogin } from '../actions/loginActions'
import Swal from 'sweetalert2'
import { START_APPLIANCE_GAME } from '../constants/gameConstants'
import Loader from './Loader'

class ApplicanceMode extends React.Component {
  UNSAFE_componentWillMount() {
    localStorage.removeItem('game_updated')
    this.props.checkUserIsLogin().then(res => {
      if (!res) {
        Swal({
          position: 'center',
          type: 'warning',
          title: 'Please LogIn to Continue',
          showConfirmButton: false,
          timer: 2000,
        })
        this.props.history.push('/')
      } else {
        if(res.account.role != 'player') this.gameData() 
        else this.props.history.push('/')
      }
    })
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (np.game.game && np.game.game.code) window.location = '/games/' + np.game.game.code
  }

  gameData = () => {
    var values = {}
    values['game'] = {}
    var url = new URL(window.location.href)
    if (url.searchParams.get('jukebox'))
      values['game']['jukebox'] = url.searchParams.get('jukebox').includes('t') ? true : false
    if (url.searchParams.get('playlist')) values['game']['playlist'] = url.searchParams.get('playlist')
    if (url.searchParams.get('songCount')) values['game']['song_count'] = url.searchParams.get('songCount')
    if (url.searchParams.get('backgroundMusic'))
      values['game']['background_music'] = url.searchParams.get('backgroundMusic').includes('t') ? true : false
    if (url.searchParams.get('adCamp')) values['game']['campaign_id'] = url.searchParams.get('adCamp')
    if (url.searchParams.get('timer')) values['game']['timer'] = parseInt(url.searchParams.get('timer')) || 10
    if (url.searchParams.get('profile')) values['game']['profile'] = url.searchParams.get('profile')
    if (url.searchParams.get('pickPlaylist'))
      values['game']['pickPlaylist'] = url.searchParams.get('pickPlaylist').includes('t') ? true : false
    this.props.postRequest('games/launch_appliance', { type: START_APPLIANCE_GAME, values: values })
  }

  render() {
    return (
      <div>
        <Loader />
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}
export default connect(
  state => {
    return {
      game: state.game,
    }
  },
  mapDispatchToProps
)(ApplicanceMode)
