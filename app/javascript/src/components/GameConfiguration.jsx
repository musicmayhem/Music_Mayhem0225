/* global localStorage location window document*/
import React from 'react'
import { FormGroup, Label, Input, FormFeedback, Container, Row, Col, Collapse} from 'reactstrap'
import { connect } from 'react-redux'
import { Field, reduxForm, change, formValueSelector } from 'redux-form'
import { checkUserIsLogin } from '../actions/loginActions'
import { makeRequest, postRequest, getDefaultTime, instantRequest } from '../actions/gameAction'
import { updateGame, getGameData, clearState, sendVolumePusherRequest } from '../actions/hostGameActions'
import Loader from './Loader'
import {
  SERIES_OPTIONS,
  GET_OPEN_SERIES_LIST_SUCCESS,
  GET_SERIES_DETAIL,
  SELECTED_SONG_SKIPPED,
} from '../constants/gameConstants'
import { createPlayer } from '../actions/playerActions'
import {
  GET_PLAYLIST_AND_AD_CAMP_SUCCESS,
  GET_GAME_PROFILES_SUCCESS,
  START_GAME_IN,
  GET_OPEN_SESSION_LIST_SUCCESS,
  RESET_SCORE,
  RESET_GAME,
  GAME_PLAYERS,
} from '../constants/gameConstants'
import Swal from 'sweetalert2'
import Modal from 'react-responsive-modal'
import pusher from '../constants/pusher'
import StandardTriviaForm from './StandardTriviaForm'
import MayhemMatesForm from './MayhemMatesForm'
import GameOverScreen from './GameOverScreen'
import PlaylistFilter from './PlaylistFilter'
import BackgroundMusicControl from './BackgroundMusicControl'
import ReviewPlaylist from './ReviewPlaylist'
import ChatModal from './ChatModal'
import { HelpSection } from './Utils/HelpSection'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const renderSelectField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="custom-form-field-w-label">
    <Label>{label}</Label>
    <Input {...input} {...custom} type="select" style={{ color: '#ffca27' }}>
      {custom.options}
    </Input>
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="custom-form-field-yellow-w-label">
    <Label>{label}</Label>
    <Input
      {...input}
      {...custom}
      onChange={input.onChange}
      value={input.value}
      max={custom.max}
      maxLength={input.maxLength}
      min="1"
      type={custom.type}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      style={{ color: '#ffca27' }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const renderCheckBoxField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="game-config-checkbox-css">
    <Label style={{ margin: '0.4rem 1rem', fontSize: 'large' }}>{label}</Label>
    <Input
      {...input}
      {...custom}
      type={custom.type}
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      style={{ color: '#ffca27' }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const validate = values => {
  const errors = { game: {} }

  const gameFields = ['trivia_url']

  gameFields.forEach(field => {
    if (values['game'] && !values['game'][field]) {
      switch (field) {
        case 'trivia_url':
          errors['game'][field] = 'URL is required'
          break
      }
    }
  })

  return errors
}

const gameTimes = START_GAME_IN.map((game_time, index) => <option key={index}> {game_time.time} </option>)

class GameConfiguration extends React.Component {
  state = {
    open: false,
    accountRole: null,
    openSessionModel: false,
    openSessionList: false,
    openSeriesList: false,
    openSeriesModel: false,
    sessionOption: 'new',
    sessionId: '',
    showSessionDiv: true,
    profileData: null,
    name: null,
    seriesName: null,
    seriesDescription: null,
    description: null,
    openSeriesSessionModel: false,
    sessionSeriesName: null,
    addSeries: false,
    modalData: null,
    hostId: null,
    remoteHostId: null,
    remoteHostEmail: null,
    standardTriviaMode: false,
    mayhemMatesMode: false,
    gameOverScreen: false,
    showBackgroundMusicControl: false,
    reviewPlaylist: false,
    songsData: null,
    configChange: false,
    showBackgroundMusicPlaylist: false,
    selectedPlaylist: '658',
    filterPlaylistModal: false,
    filteredSongCount: null,
    playlistEras: [],
    playlistGenres: [],
    collapse: false,
    songSkipCount: 0,
    showChatModal: false,
  }

  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (!res) {
        this.props.history.push('/')
      } else {
        this.props.makeRequest('games/get_game_profiles', { type: GET_GAME_PROFILES_SUCCESS })
        this.props.makeRequest('games/get_open_series_list', { type: GET_OPEN_SERIES_LIST_SUCCESS })
        this.props.makeRequest('games/get_open_session_list', { type: GET_OPEN_SESSION_LIST_SUCCESS })
        this.props.makeRequest('games/generate_playlist', { type: GET_PLAYLIST_AND_AD_CAMP_SUCCESS })
        this.props.dispatch(getGameData({ game: { code: this.props.match.params.game_code } }))
        this.setState({ accountRole: res.account.role })
        if (res.account.role == 'host') this.setState({ hostId: res.account.id })
      }
    })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!this.props.game.game && nextProps.game.game) {
      this.loadGameData(nextProps.game)
      if (this.props.game.profile && nextProps.game.profile) {
        const profile = nextProps.game.profile.filter(x => x.id == nextProps.game.game.profile_id)[0]
        this.setState({ profileData: profile })
        this.props.changeFieldValue('game.profile', profile.name)
      }

      if (
        nextProps.game &&
        nextProps.game.game &&
        nextProps.game.game.background_music
      )
        this.setState({ showBackgroundMusicControl: true, showBackgroundMusicPlaylist: true })
      if (
        nextProps.game &&
        nextProps.game.game &&
        nextProps.game.game.state &&
        nextProps.game.game.state == 'Game Over'
      )
        this.setState({ gameOverScreen: true })
    }

    if (localStorage['game_config_updated']) {
      if (this.state.accountRole == 'host') {
        if (this._config_page) {
          nextProps.history.push('/remote/' + this.props.match.params.game_code)
        } else if (!this._config_page) {
          localStorage.removeItem('game_config_updated')
          window.location = '/config/' + this.props.match.params.game_code
        }
      } else {
        if (this.state.accountRole == 'player' && this.props && this.props.player) {
          // this.props.createPlayer({ game_code: this.props.match.params.game_code })
          if (
            this.props &&
            this.props.player &&
            this.props.player.creatingPlayer &&
            !nextProps.player.creatingPlayer &&
            nextProps.player.playerCreated
          ) {
            nextProps.history.push('/player/' + this.props.match.params.game_code)
            localStorage.removeItem('game_config_updated')
          }
        }
      }
    } else {
      let arr = ['song_count', 'playlist_id', 'background_music', 'automatic_song_advance', 'background_music_playlist', 'show_title_hint', 'show_artist_hint','show_year_hint','game_code_display','round_leaderboard','game_over_leaderboard']
      // if (nextProps.game && nextProps.game.game && this._updateSession && !nextProps.game.game.open_session) {
      //   this._updateSession = false
      //   if (nextProps.game.game.campaign_id) this.getCampaign(nextProps.game.game.campaign_id)
      // }
      if (nextProps.game.gameDataRecieved && nextProps.game.gameUpdated) {
        localStorage['game_config_updated'] = true
        Swal({
          type: 'success',
          title: 'Updated...',
          text: 'Game Updated successfully!',
          showConfirmButton: false,
          timer: 1500,
        })
        this.props.clearState()
      }
      if (nextProps.game.gameDataRecieved && nextProps.game.rounds && nextProps.game.rounds.settings && this._runOnce) {
        arr.map(x =>
          ['song_count', 'playlist_id', 'background_music_playlist'].includes(x)
            ? this.props.changeFieldValue('game.' + x, nextProps.game.rounds.settings[x])
            : this.props.changeFieldValue('game.' + x, nextProps.game.game[x])
        )
        if(nextProps.game.rounds.settings['playlist_id']) this.setState({ selectedPlaylist: nextProps.game.rounds.settings['playlist_id']})
        this._runOnce = false
      }
    }

    if (nextProps.game && nextProps.game.new_code) location.replace('/config/' + nextProps.game.new_code)

    if (nextProps.game && nextProps.game.game && nextProps.game.game.account_id != this.state.hostId)
      this.setState({ remoteHostId: this.state.hostId })
    // if (nextProps.game && nextProps.game.rounds && nextProps.game.rounds.song_order_ids.length > 0 && this._runOnce2) {
    //   this._runOnce2 = false
    //   this.props
    //     .instantRequest('games/get_songs', {
    //       values: { song_order_ids: nextProps.game.rounds.song_order_ids },
    //     })
    //     .then(res => {
    //       if (res) this.setState({ songsData: res })
    //     })
    // }
    if (nextProps.game && nextProps.game.songsData && nextProps.game.songsData.length > 0) {
      this.setState({ songsData: nextProps.game.songsData })
      if (nextProps.game.songsData != this.state.songsData) this._skipSong = true
    }
  }

  _config_page = true
  _runOnce = true
  _runOnce2 = true
  venue_name = null
  venueCount = null
  campaign_id = 0
  _updateSession = true
  _skipSong = true
  _songOrderIds = null

  updatedGameValues = values => {
    var playlist =
      this.props.game &&
      this.props.game.playlist &&
      this.props.game.playlist.filter(p => p[0] == values['game']['playlist_id'])
    if (values['game']['trivia_url'])
      this.startTrivia()
    else if (this.state.mayhemMatesMode)
      this.startMayhemMates()
    else if (this.state.accountRole == 'host' &&  playlist[0] && values['game']['song_count'] > playlist[0][2]) {
      Swal({
        type: 'warning',
        title: 'Song Count should be less the playlist songs',
        showConfirmButton: false,
        timer: 1500,
      })
    } else if (
      this.props.game.game &&
      !this.props.game.game.campaign_id &&
      this.state.accountRole == 'host' &&
      (values.game.campaign_id == '0' || values.game.campaign_id == null || this.venue_name === '')
    ) {
      this.campaign_id = 0
      Swal({
        type: 'warning',
        title: 'Venue is required',
        showConfirmButton: false,
        timer: 1500,
      })
    } else {
      let defaultProfileData = {
        id: 3,
        name: 'Default',
        background_music: true,
        song_count: 11,
        point_value: 100,
        guess_timer: 70,
        song_play_time: 70,
        automatic_song_advance: true,
        leaderboard_display_time: 20,
        game_over_display_time: 20,
        show_title_hint: true,
        show_artist_hint: true,
        show_year_hint: false,
        game_code_display: true,
        round_leaderboard: true,
        game_over_leaderboard: true,
      }

      if (this.state.sessionOption == 'new') {
        values['game']['open_session'] = true
        if (!this.props.game.current_session) values['game']['session'] = this.state.modalData
        else values['game']['session'] = this.props.game.session
      }
      if (this.state.sessionOption == 'existing') values['game']['session_id'] = this.state.sessionId
      values['game']['profile_data'] = this.state.profileData || defaultProfileData
      values['game']['code'] = this.props.match.params.game_code
      if (values['game']['playlist_id'] == 0) delete values.game.playlist_id
      if (values['game']['campaign_id'] == 0) delete values.game.campaign_id
      if (values['game']['timer'] == '30 seconds') values['game']['timer'] = '0.5 minute'
      if (values['game']['timer'] == 'now!') {
        values['game']['timer'] = '0.233 minute'
        values['game']['background_music'] = false
      }
      values['game']['state'] = 'Game Updated'
      if (this.state.sessionOption == 'none' || this.state.accountRole == 'player') {
        delete values.game.open_session
        delete values.game.session
        delete values.game.session_id
      }
      if (values['game']['timer'] == 'update only') {
        this._config_page = false
        values['game']['update'] = true
        values['game']['timer'] = '1 minute'
      }
      values['game']['profile_id'] = (this.state.profileData && this.state.profileData.id) || defaultProfileData.id
      if (this.state.remoteHostId) values['game']['remote_host_id'] = this.state.remoteHostId
      values['game']['song_order_ids'] = this._songOrderIds
      this.props.updateGame(values)
    }
  }

  seriesSessionRequest(p) {
    this.setState({ sessionId: p })
  }

  seriesRequest = p => {
    if (p !== 'SELECT SERIES') {
      switch (p) {
        case 'NEW SERIES':
          this.setState({ openSeriesModel: true })
          break
        default:
          this.setState({ openSeriesSessionModel: true, sessionSeriesName: p })
          this.props.postRequest('games/get_series_detail', { type: GET_SERIES_DETAIL, values: { series_id: p } })
          break
      }
    }
  }
  getHelp() {
    HelpSection()
  }

  resetRound = () => {
    let rRound = document.getElementById('resetRound')
    if (rRound.checked) {
      this.props.postRequest('games/reset_round_score', {
        type: RESET_SCORE,
        values: { game: { code: this.props.match.params.game_code } },
      })
      Swal({
        type: 'success',
        title: 'Updated...',
        text: 'Score Reset Successfully!',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  resetGame = () => {
    this.props.postRequest('games/reset_game', {
      type: RESET_GAME,
      values: { game: { code: this.props.match.params.game_code } },
    })
    Swal({
      type: 'success',
      title: 'Updated...',
      text: 'Game Reset Successfully!',
      showConfirmButton: false,
      timer: 1500,
    })
  }

  updateGameConfigurationFromProfile = p => {
    let arr = ['song_count', 'background_music', 'timer', 'automatic_song_advance', 'show_title_hint', 'show_artist_hint','show_year_hint','game_code_display','round_leaderboard','game_over_leaderboard']
    if (p == 'Trivia Mode') {
     if(this.venue_name || this.props.game && this.props.game.game && this.props.game.game && this.props.game.game.campaign_id){
       this.setState({ standardTriviaMode: true, collapse: true })
       window.history.pushState('object or string','Title', 'config/'+this.props.match.params.game_code+'?Continue')
     }
     else
       Swal({
         type: 'warning',
         title: 'Venue is required',
         showConfirmButton: false,
         timer: 1500,
       })
   }

    if (p == 'Mayhem Mates Mode') {
     if(this.venue_name || this.props.game && this.props.game.game && this.props.game.game && this.props.game.game.campaign_id){
       this.setState({ mayhemMatesMode: true, collapse: true })
       window.history.pushState('object or string','Title', 'config/'+this.props.match.params.game_code+'?Continue')
     }
     else
       Swal({
         type: 'warning',
         title: 'Venue is required',
         showConfirmButton: false,
         timer: 1500,
       })
   }

    if (p !== 'SELECT PROFILE') {
      const data = this.props.game.profile.filter(x => x.name === p)[0]
      this.setState({ profileData: data, showBackgroundMusicPlaylist: data['background_music'] })
      arr.map(x => this.props.changeFieldValue('game.' + x, data[x]))
      if (data['playlist_id'] != null) {
        this.setState({ selectedPlaylist: data['playlist_id'], filteredSongCount: null, playlistEras: [], playlistGenres: []})
        this.props.changeFieldValue('game.playlist_id', data['playlist_id'])
      }
      else this.props.changeFieldValue('game.playlist_id', 658)
    }
  }

  newSeriesValues = values => {
    this.setState({ openSeriesModel: false, seriesData: values })
  }

  modalValues = values => {
    values = {
      name: values || this.props.dispatch(change('updatedGameForm', 'session.name', this.venue_name)).payload,
      description: this.state.description,
      sessionSeriesName: this.state.sessionSeriesName,
      seriesData: { name: this.state.seriesName, description: this.state.seriesDescription },
    }
    this.setState({ modalData: values })
  }

  getPlayerList() {
    let playerPick = document.getElementById('pick')
    if (playerPick.checked) {
      this.props.postRequest('games/game_players', {
        type: GAME_PLAYERS,
        values: { game: { code: this.props.match.params.game_code } },
      })
      this.setState({ open: true })
    }
  }
  sendPlaylistPusherToPlayer(player) {
    this.props.postRequest('player/set_playlist', { values: { player: player } })
  }

  loadGameData(gameData) {
    if (gameData.game) {
      let channel_name = 'games_' + gameData.game.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('game_event', data => {
        console.log(data.type)
        switch (data.type) {
          case 'game_updated':
            var url = data.data.replace('/games/', '/remote/')
            window.location = url
            break
          case 'update_players_selected_playlist':
            this.setState({ open: false })
            this.props.changeFieldValue('game.playlist_id', data.data)
            break
          case 'new_message':
            if (data.data.message_to == 'Game Host')
              this.noticeAlert(' 💬 '+data.data.message_from+' : '+data.data.message+' ')
            break
        }
      })
    }
  }

  noticeAlert(text) {
    toast.success(text, {
      position: 'top-right',
      autoClose: 60000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      draggablePercent: 40,
      className: 'toaster-css-2',
    })
  }

  getCampaign = campaign_id => {
    var camp_venue_name = null
    if (campaign_id === '0') {
      camp_venue_name =
        this.props.game && this.props.game.campaign && this.props.game.campaign.find(x => x[0] == campaign_id)[1]
    } else {
      camp_venue_name =
        this.props.game &&
        this.props.game.campaign &&
        this.props.game.campaign
          .find(x => x[0] == campaign_id)[1]
          .trim()
          .replace(' ', '-') +
          '-' +
          getDefaultTime()
      this.props
        .instantRequest('games/active_camp_session', {
          values: { camp: camp_venue_name },
        })
        .then(res => {
          if (res) {
            this.setActiveCampSession(res)
          } else {
            this.setState({ sessionId: '', sessionOption: 'new' })
            this.props.changeFieldValue('game.open_session', '')
          }
        })
    }
    var name = this.props.dispatch(change('updatedGameForm', 'session.name', camp_venue_name)).payload
    this.modalValues(name)
    this.venue_name = camp_venue_name
    var length = this.venue_name ? this.venue_name.length : 0
    if (
      this.props.game &&
      this.props.game.sessionList &&
      camp_venue_name &&
      this.props.game.sessionList.map(x => x.name.substr(0, length) === camp_venue_name.toLowerCase()) &&
      this.props.game.sessionList
        .map(x => x.name.substr(0, length) === camp_venue_name.toLowerCase())
        .find(x => x == true)
    ) {
      this.venueCount = this.props.game.sessionList
        .map(x => x.name.substr(0, length) === camp_venue_name.toLowerCase())
        .filter(x => x == true).length
      this.updateVenue()
    }
    if(this.props.profile == 'Trivia Mode' || this.props.profile == 'Mayhem Mates Mode')
     this.props.changeFieldValue('game.profile', 'Default')
  }

  updateVenue() {
    this.venue_name = this.venue_name + '-' + this.venueCount
    var name = this.props.dispatch(change('updatedGameForm', 'session.name', this.venue_name)).payload
    this.modalValues(name)
  }

  setActiveCampSession(data) {
    Swal.fire({
      title: 'Found Existing Session',
      text: 'Do you want to use session ' + data.name + '?',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'No, Create New',
      confirmButtonText: 'Use Session',
    }).then(result => {
      if (result.value) {
        Swal.fire({
          type: 'success',
          title: 'Updated! Game session has been updated.',
          showConfirmButton: false,
          timer: 1500,
        })
        this.setState({ sessionId: data.id, sessionOption: 'existing' })
        this.props.changeFieldValue('game.open_session', data.id)
      } else {
        this.setState({ sessionId: '', sessionOption: 'new' })
        this.props.changeFieldValue('game.open_session', '')
      }
    })
  }

  volumeButton(p) {
    this.props.dispatch(sendVolumePusherRequest({ game: { code: this.props.match.params.game_code }, volume: p }))
  }

  getSongData() {
   if (!this.state.reviewPlaylist && (!this.state.songsData || this.state.configChange)) {
     if(this.state.filteredSongCount && (parseInt(this.state.filteredSongCount) < parseInt(this.props.song_count)) || !parseInt(this.props.song_count) || this.props.song_count == ''){
       Swal({
         type: 'warning',
         title: 'You cannot proceed with this song count',
         showConfirmButton: false,
         timer: 1500,
       })
     } else if (this.props.playlist_id == '0') {
       Swal({
         type: 'warning',
         title: 'Please Select Playlist First',
         showConfirmButton: false,
         timer: 1500,
       })
     } else {
      this.setState({ configChange: false, reviewPlaylist: false })
      this.props
        .instantRequest('games/get_song_data', {
          values: {
            playlist_id: this.props.playlist_id,
            song_count: this.props.song_count,
            game: { code: this.props.match.params.game_code, random_play: this.props.random_play },
            eras: this.state.playlistEras,
            genres: this.state.playlistGenres,
          },
        })
        .then(res => {
          if (res) this.setState({ songsData: res, reviewPlaylist: true })
        })
    }
   }
  }

  skipSelectedSong = (song_id) => {
    if (this._skipSong) {
      this._skipSong = false
      this.props.dispatch(
        postRequest(
          'games/skip_song_data',
          {
            type: SELECTED_SONG_SKIPPED,
            values: { game: { code: this.props.match.params.game_code, song_skip_count: this.state.songSkipCount }, songId: song_id },
          },
          true
        )
      )
      this.setState({ songSkipCount: this.state.songSkipCount + 1 })
    }
  }

  startTrivia = () =>{
    let trivia_url_data = {
      game: {
        trivia_url: this.props.trivia_url,
        game_mode: 'Standard trivia',
        code: this.props.match.params.game_code,
        state: 'Standard trivia',
        open_session: true,
        campaign_id: this.props.campaign_id,
        session: {
          name: this.venue_name,
        },
        background_music: this.props.background_music,
        background_music_playlist: this.props.background_music_playlist,
      },
    }
    this.props.updateGame(trivia_url_data)
  }

  startMayhemMates = () =>{
    let mayhem_mates_data = {
      game: {
        game_mode: 'Mayhem Mates',
        code: this.props.match.params.game_code,
        state: 'Mayhem Mates',
        open_session: true,
        campaign_id: this.props.campaign_id,
        session: {
          name: this.venue_name,
        },
        mayhem_mates_words: ['Love','Babe','Like','Heart','Need','Want','Cute','Kiss','Hug','Butts','Snuggle','Swoon','Smile','Flirt','Wink'],
        background_music: this.props.background_music,
        background_music_playlist: this.props.background_music_playlist,
      },
    }
    this.props.updateGame(mayhem_mates_data)
  }

  setSongOrder(){
    var dataArray = document.getElementsByClassName('song-info-config')
    var song_order_ids = []
    var i=0
    for(i=0; i<dataArray.length; i++)
      song_order_ids = song_order_ids.concat(dataArray[i].getAttribute('data'))
    this._songOrderIds = song_order_ids
    // this.setState({ songOrderIds: song_order_ids })
  }
  startDemoVideo = (e) => {
    e.preventDefault()
    redirectWindow = window.open(
      '/vdemo',
      '_blank',
      'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=9999, height=9999'
    )
  }


  render() {
    let seriesOptions = null
    let seriesData =
      this.props.game.seriesList && this.props.game.seriesList.length > 0 && this.props.game.seriesList.map(x => x.name)
    if (seriesData)
      seriesOptions = SERIES_OPTIONS.concat(seriesData).map((series, index) => <option key={index}> {series} </option>)
    else seriesOptions = SERIES_OPTIONS.map((series, index) => <option key={index}> {series} </option>)

    const { openSeriesModel, addSeries, standardTriviaMode, gameOverScreen, mayhemMatesMode } = this.state
    let newOptions = {}
    const defaultOptions = {
      '100': { id: 0, name: 'PLEASE SELECT SESSION', description: '', series_id: null, created_at: '' },
    }
    const { gamePlayers, playlist, campaign, updatingGame, profile, current_session, playlistData } = this.props.game
    const { handleSubmit } = this.props
    const { accountRole, open, showBackgroundMusicControl, songsData, reviewPlaylist, showBackgroundMusicPlaylist, selectedPlaylist, filterPlaylistModal, playlistEras, playlistGenres, filteredSongCount, showChatModal } = this.state
    var totalSongCount = 0
    if (this.props.game && this.props.game.game && this.props.game.game.current_song_count && this.props.song_count) {
      totalSongCount =
        parseInt(this.props.game.game.current_song_count.slice(4, 7)) + parseInt(this.props.song_count) - 1
    }
    if (
      this.props.game &&
      this.props.game.profile &&
      this.props.game.profile.filter(x => x.name === 'SELECT PROFILE').length === 0
    )
      profile.unshift({ id: 0, name: 'SELECT PROFILE' })
    if (
      this.props.game.sessionList &&
      Object.keys(this.props.game.sessionList) &&
      Object.keys(this.props.game.sessionList).length > 0
    ) {
      newOptions = { ...defaultOptions, ...this.props.game.sessionList }
      newOptions = Object.assign([], newOptions).reverse()
    }
    return (
      <div>
        {showChatModal && <ChatModal code={this.props.match.params.game_code} closeModal={() => this.setState({ showChatModal: false })}/>}
        {!gameOverScreen && (
          <Container style={{ padding: '0 2rem', paddingBottom: '4rem' }}>
            <form onSubmit={handleSubmit(this.updatedGameValues)}>
              {this.props.game.gettingGameData && <Loader />}
              {!this.props.game.gettingGameData && (
                <Row center="xs">
                  <Col sm="12" md={{ size: 6, offset: 3 }}>
                    <div className="py-3">
                      <Row center="xs">
                        <Col x={4} style={{ color: '#ffca27', marginBottom: '15px' }}>
                          <a
                            style={{ float: 'left' }}
                            onClick={() => {
                              this.getHelp()
                            }}
                          >
                            <i className="fa fa-life-ring" /> Host Help
                          </a>
                        </Col>
                        <Col xs={4} style={{ color: '#ffca27', marginBottom: '15px' }}>
                          <div>
                            <a
                              style={{ float: 'right' }}
                              onClick={() => {
                                this.setState({ showChatModal: true })
                              }}
                            >
                              <i className="fa fa-comments-o" aria-hidden="true"></i> Game Chat
                            </a>
                          </div>
                        </Col>
                        <Col xs={4} style={{ color: '#ffca27', marginBottom: '15px' }}>
                          <div>
                            <a
                              style={{ float: 'right', color: "#ffca27" }}
                              onClick={this.startDemoVideo}
                              target="_blank"
                            >
                              <i className="fa fa-play" aria-hidden="true"></i> Play Demo
                            </a>
                          </div>
                        </Col>

                      </Row>
                      <div>
                        <div>
                          <h4 style={{ color: '#fff', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {' '}
                            {this.props.match.params.game_code}:{' '}
                            <a
                              style={{ color: '#fff' }}
                              onClick={() => {
                                this.setState({ standardTriviaMode: false, mayhemMatesMode: false })
                              }}
                            >
                              Configure |
                            </a>{' '}
                            <a href={'/remote/' + this.props.match.params.game_code}>Control </a>
                          </h4>
                          {!standardTriviaMode && !mayhemMatesMode && accountRole == 'host' && !current_session && (
                            <Field
                              name="game.campaign_id"
                              component={renderSelectField}
                              onChange={p => (this.getCampaign(p.target.value), (this.campaign_id = p.target.value))}
                              options={
                                campaign
                                  ? campaign.map(p => (
                                      <option key={p[0]} value={p[0]}>
                                        {' '}
                                        {p[1]}{' '}
                                      </option>
                                    ))
                                  : ''
                              }
                              label="SELECT VENUE"
                            />
                          )}
                          {!standardTriviaMode && !mayhemMatesMode && (
                            <div>
                              {accountRole == 'host' && (
                                <Field
                                  name="game.profile"
                                  component={renderSelectField}
                                  options={profile ? profile.map(p => <option key={p.id}> {p.name} </option>) : ''}
                                  label="SELECT GAME PROFILE"
                                  onChange={p => {
                                    this.updateGameConfigurationFromProfile(p.target.value)
                                    this.setState({ songsData: null, reviewPlaylist: false, configChange: true, songSkipCount: 0 })
                                  }}
                                />
                              )}
                              <Field
                                name="game.timer"
                                component={renderSelectField}
                                options={gameTimes}
                                label="START GAME IN:"
                              />
                              <h1
                                style={{ fontWeight: '700', color: '#ffca27', fontSize: '1rem', cursor: 'pointer', padding: '0.5rem'}}
                                onClick={()=> this.setState({collapse: !this.state.collapse})}
                                >Advanced Options
                              </h1>
                              <Collapse  isOpen={this.state.collapse}>
                                {(
                                  <div>
                                  <Field
                                    name="game.playlist_id"
                                    component={renderSelectField}
                                    options={
                                      playlist
                                        ? playlist.map(p => (
                                            <option key={p[0]} value={p[0]}>
                                              {' '}
                                              {p[1] == 'SELECT PLAYLIST' ? p[1] : p[1] + ' (' + p[2] + ')'}{' '}
                                            </option>
                                          ))
                                        : ''
                                    }
                                    label="SELECT A PLAYLIST"
                                    onChange={e => {
                                      this.setState({ songsData: null, reviewPlaylist: false, configChange: true, selectedPlaylist: e.target.value, filteredSongCount: null, playlistEras: [], playlistGenres: [], songSkipCount: 0 })
                                      }
                                    }
                                  />
                                  {this.props.playlist_id && this.props.playlist_id !== '0' &&(
                                    <h2
                                      style={{ fontWeight: '700', color: '#ffca27', fontSize: '1rem', cursor: 'pointer', textDecoration: 'underline'}}
                                      onClick={()=> this.setState({filterPlaylistModal: !filterPlaylistModal})}
                                      >
                                        Filter Playlist Songs
                                    </h2>
                                  )}
                                  <Modal
                                    modalOptions={{ dismissible: false }}
                                    open={filterPlaylistModal}
                                    onClose={() => this.setState({ filterPlaylistModal: false })}
                                    showCloseIcon={false}
                                    center
                                  >
                                    <div style={{ textAlign: 'center', margin: '30px' }}>
                                     <PlaylistFilter
                                       selectedPlaylist={selectedPlaylist}
                                       playlistData={playlistData}
                                       playlistEras={this.state.playlistEras}
                                       playlistGenres={this.state.playlistGenres}
                                       filteredSongCount={filteredSongCount}
                                       filterPlaylistModal={ x => { this.setState({ filterPlaylistModal: x }) }}
                                       setEras={ eras => { this.setState({ playlistEras: eras }) }}
                                       setGenres={ genres => { this.setState({ playlistGenres: genres, configChange: true, songsData: null, songSkipCount: 0 }) }}
                                       setFitererdSongCount={ filteredSongCount => {
                                         if (parseInt(filteredSongCount) && parseInt(this.props.song_count) > parseInt(filteredSongCount))  this.props.changeFieldValue('game.song_count', filteredSongCount)
                                         this.setState({ filteredSongCount: filteredSongCount })
                                       }}
                                       {...this.props}
                                     />
                                    </div>
                                 </Modal>
                                </div>
                                )}
                                <Field
                                  name="game.song_count"
                                  component={renderTextField}
                                  label="Song Count"
                                  type="number"
                                  maxLength="2"
                                  max={filteredSongCount && filteredSongCount <= 100 ? filteredSongCount : "100" }
                                  onChange={() =>
                                    this.setState({ songsData: null, reviewPlaylist: false, configChange: true, songSkipCount: 0 })
                                  }
                                />
                              </Collapse>
                            </div>
                            )}
                             <Collapse isOpen={this.state.collapse}>
                              <Field
                                name="game.background_music"
                                component={renderCheckBoxField}
                                label="BACKGROUND MUSIC ON"
                                type="checkbox"
                                onClick={e =>{
                                  this.setState({ showBackgroundMusicPlaylist: !showBackgroundMusicPlaylist })
                                }}
                              />
                              {showBackgroundMusicPlaylist && (
                                <div>
                                  <Field
                                    name="game.background_music_playlist"
                                    component={renderSelectField}
                                    options={
                                      playlist
                                        ? playlist.map(p => (
                                            <option key={p[0]} value={p[0]}>
                                              {' '}
                                              {p[1] == 'SELECT PLAYLIST' ? p[1] : p[1] + ' (' + p[2] + ')'}{' '}
                                            </option>
                                          ))
                                        : ''
                                    }
                                    label="SELECT BACKGROUND MUSIC PLAYLIST"
                                  />
                                </div>
                              )}
                            </Collapse>
                              {!standardTriviaMode && !mayhemMatesMode &&(
                              <div>
                              <Collapse isOpen={this.state.collapse}>
                              <Field
                                name="game.automatic_song_advance"
                                component={renderCheckBoxField}
                                label="AUTO ADVANCE SONGS"
                                type="checkbox"
                              />
                              {this.state.sessionOption != 'none' && (
                                <Field
                                  name="game.show_scoreboard"
                                  component={renderCheckBoxField}
                                  label="SHOW LEADERBOARD"
                                  type="checkbox"
                                />
                              )}
                              <Field
                                name="game.show_title_hint"
                                component={renderCheckBoxField}
                                label="SHOW TITLE HINT"
                                type="checkbox"
                                onChange={e => this.props.changeFieldValue('game.show_year_hint', false)}
                              />
                              <Field
                                name="game.show_artist_hint"
                                component={renderCheckBoxField}
                                label="SHOW ARTIST HINT"
                                type="checkbox"
                              />
                              <Field
                                name="game.show_year_hint"
                                component={renderCheckBoxField}
                                label="SHOW YEAR HINT"
                                type="checkbox"
                                onChange={e => this.props.changeFieldValue('game.show_title_hint', false)}
                              />
                              <Field
                                id="pick"
                                name="game.player_pick"
                                component={renderCheckBoxField}
                                label="PLAYER PICKS PLAYLIST"
                                type="checkbox"
                                onChange={() => this.getPlayerList()}
                              />
                              <Field
                                id="pick"
                                name="game.game_code_display"
                                component={renderCheckBoxField}
                                label="GAME CODE DISPLAY"
                                type="checkbox"
                              />
                              <Field
                                id="pick"
                                name="game.round_leaderboard"
                                component={renderCheckBoxField}
                                label="ROUND LEADERBOARD"
                                type="checkbox"
                              />
                              <Field
                                id="pick"
                                name="game.game_over_leaderboard"
                                component={renderCheckBoxField}
                                label="GAME OVER LEADERBOARD"
                                type="checkbox"
                              />
                              <Field
                                name="game.random_play"
                                component={renderCheckBoxField}
                                label="RANDOMISE PLAYLIST SONGS"
                                type="checkbox"
                                onChange={e => {
                                  this.setState({ songsData: null, reviewPlaylist: false, configChange: true, songSkipCount: 0  })
                                  }
                                }
                              />
                              <Modal open={open} onClose={() => this.setState({ open: false })} center>
                                <Container
                                  style={{
                                    borderTop: '1px solid #ddd',
                                    borderBottom: '1px solid #ddd',
                                    padding: '1.5rem 0.5rem',
                                  }}
                                >
                                  <Row start={'xs'}>
                                    <Col sm="6" style={{ textAlign: 'center' }}>
                                      <p style={{ color: '#210344' }}>Name</p>
                                    </Col>
                                    <Col sm="6" style={{ textAlign: 'center' }}>
                                      <p style={{ color: '#210344' }}>Action</p>
                                    </Col>
                                  </Row>
                                  {gamePlayers &&
                                    gamePlayers.map((x, i) => (
                                      <span key={i}>
                                        <Row start="xs">
                                          <Col sm="6" style={{ color: '#888' }}>
                                            <p>{x.name}</p>
                                          </Col>
                                          <Col sm="6" style={{ textAlign: 'center', color: '#888' }}>
                                            <a
                                              className="mayhem-link-light"
                                              onClick={() => this.sendPlaylistPusherToPlayer(x)}
                                            >
                                              Send
                                            </a>
                                          </Col>
                                        </Row>
                                      </span>
                                    ))}
                                </Container>
                              </Modal>
                              {!current_session && accountRole == 'host' && (
                                <div style={{ color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                                  <div
                                    className="radio-round"
                                    onClick={() => {
                                      this.setState({ sessionOption: 'new', openSessionModel: true })
                                    }}
                                  >
                                    <div>{this.state.sessionOption === 'new' && <div />} </div>
                                    <label>NEW SESSION?</label>
                                  </div>
                                  <div
                                    className="radio-round"
                                    onClick={() => {
                                      this.setState({ sessionOption: 'existing', openSessionList: true })
                                    }}
                                  >
                                    <div>{this.state.sessionOption === 'existing' && <div />} </div>
                                    <label>EXISTING SESSIONS?</label>
                                  </div>
                                  <div
                                    className="radio-round"
                                    onClick={() => {
                                      this.setState({ sessionOption: 'none', openSessionModel: true })
                                    }}
                                  >
                                    <div>{this.state.sessionOption === 'none' && <div />} </div>
                                    <label>NO SESSION</label>
                                  </div>
                                </div>
                              )}
                              {current_session && (
                                <h5 style={{ textTransform: 'uppercase', color: 'white', fontWeight: 'bold' }}>
                                  Session: <span style={{ color: '#ffca27' }}> &ldquo; {current_session} &rdquo; </span>
                                </h5>
                              )}
                              {!current_session &&
                                this.state.showSessionDiv &&
                                accountRole == 'host' &&
                                this.state.sessionOption == 'new' && (
                                  <div style={{ padding: '1rem', backgroundColor: 'white' }}>
                                    <div>
                                      <FormGroup>
                                        {this.venue_name ? (
                                          <div>
                                            <FormGroup>
                                              <Label>Venue</Label>
                                              <Input
                                                name="session.name"
                                                id="venue_id"
                                                type="text"
                                                placeholder="ENTER SESSION NAME"
                                                value={this.venue_name}
                                                onBlur={() => this.modalValues()}
                                                onChange={() => this.setState({ name: this.venue_name })}
                                                onInput={e => {
                                                  (this.venue_name = e.target.value), this.modalValues(this.venue_name)
                                                }}
                                              />
                                            </FormGroup>
                                            <FormGroup>
                                              <Label>DESCRIPTION</Label>
                                              <Input
                                                name="session.description"
                                                type="text"
                                                placeholder="ENTER SESS DESCRIPTION"
                                                onBlur={() => this.modalValues()}
                                                onChange={e => this.setState({ description: e.target.value })}
                                              />
                                            </FormGroup>
                                          </div>
                                        ) : (
                                          <FormGroup>
                                            <Label>Venue</Label>
                                            <Input
                                              name="session.name"
                                              type="text"
                                              placeholder="ENTER SESSION NAME"
                                              onInput={e => (
                                                (this.venue_name = e.target.value), this.modalValues(this.venue_name)
                                              )}
                                              onBlur={() => this.modalValues()}
                                              onChange={e => this.setState({ name: e.target.value })}
                                            />
                                          </FormGroup>
                                        )}
                                        <div
                                          className="remember-me"
                                          onClick={() => {
                                            this.setState({ addSeries: !this.state.addSeries })
                                          }}
                                        >
                                          <div>
                                            {this.state.addSeries && (
                                              <i style={{ color: 'black' }} className="fa fa-check" />
                                            )}{' '}
                                          </div>
                                          <label style={{ color: 'black', marginBottom: '0 !important' }}>
                                            Series Options?
                                          </label>
                                        </div>
                                        <div>
                                          {addSeries && (
                                            <FormGroup>
                                              <Input
                                                style={{ height: '40px!important' }}
                                                name="session.series_data"
                                                type="select"
                                                onBlur={() => this.modalValues()}
                                                onChange={p => this.seriesRequest(p.target.value)}
                                              >
                                                {seriesOptions}
                                              </Input>
                                            </FormGroup>
                                          )}

                                          {openSeriesModel && (
                                            <div>
                                              <FormGroup>
                                                <Label>Name</Label>
                                                <Input
                                                  name="series.name"
                                                  type="text"
                                                  placeholder="ENTER SERIES NAME"
                                                  onBlur={() => this.modalValues()}
                                                  onChange={e => this.setState({ seriesName: e.target.value })}
                                                />
                                              </FormGroup>
                                              <FormGroup>
                                                <Label>DESCRIPTION</Label>
                                                <Input
                                                  name="series.description"
                                                  onBlur={() => this.modalValues()}
                                                  type="text"
                                                  placeholder="ENTER SERIES DESCRIPTION"
                                                  onChange={e => this.setState({ seriesDescription: e.target.value })}
                                                />
                                              </FormGroup>
                                            </div>
                                          )}
                                        </div>
                                      </FormGroup>
                                    </div>
                                  </div>
                                )}
                              {!current_session && accountRole == 'host' && this.state.sessionOption === 'existing' && (
                                <Field
                                  id="sessionField"
                                  name="game.open_session"
                                  component={renderSelectField}
                                  options={
                                    newOptions && Object.keys(newOptions).length > 0 ? (
                                      newOptions.map(x => (
                                        <option key={x['id']} value={x['id']}>
                                          {' '}
                                          {x['name']}{' '}
                                        </option>
                                      ))
                                    ) : (
                                      <option key={0} value={0}>
                                        {' '}
                                        PLEASE SELECT SESSION{' '}
                                      </option>
                                    )
                                  }
                                  label="SELECT SESSION"
                                  onChange={p => this.seriesSessionRequest(p.target.value)}
                                />
                              )}
                              <br />
                              {reviewPlaylist && totalSongCount && songsData && songsData.length != 0 && (
                                <Modal
                                  open={reviewPlaylist}
                                  onClose={() => this.setState({ reviewPlaylist: false })}
                                  showCloseIcon={false}
                                  center
                                >
                                  <div style={{ textAlign: 'center', margin: '30px' }}>
                                    <ReviewPlaylist
                                      totalSongCount={totalSongCount}
                                      songsData={songsData}
                                      skipSelectedSong={this.skipSelectedSong}
                                      skip={filteredSongCount ? !(parseInt(this.props.song_count) >= filteredSongCount || !this.props.random_play &&
                                            (parseInt(this.props.song_count) + this.state.songSkipCount) >= filteredSongCount )
                                            : true}
                                      />
                                    <Row>
                                     <Col sm="6">
                                      <button className="mayhem-btn-blue btn-full-width"
                                        type="submit"
                                        style={{marginTop: '10px'}}
                                        onClick={()=> {
                                          this.setSongOrder()
                                          var e = document.getElementById('config-start-btn')
                                          if(e) e.click()
                                          this.setState({reviewPlaylist: false})
                                        }}
                                        >
                                        {updatingGame ? 'STARTING...' : 'START GAME'}
                                      </button>
                                     </Col>
                                     <Col sm="6">
                                      <button className="mayhem-btn-blue btn-full-width"
                                        style={{marginTop: '10px'}}
                                        onClick={()=> this.setState({reviewPlaylist: false})}
                                        >
                                        CANCEL
                                      </button>
                                    </Col>
                                   </Row>
                                  </div>
                                </Modal>
                              )}
                              </Collapse>
                              <Row>
                                <div
                                  className="mayhem-btn-blue btn-full-width"
                                  onClick={()=>{
                                    if( accountRole == 'host'){
                                      this.setState({ reviewPlaylist: !reviewPlaylist })
                                      this.getSongData()
                                    }else{
                                      var e = document.getElementById('config-start-btn')
                                      if(e) e.click()
                                    }
                                  }}
                                  style={{textAlign: 'center'}}
                                  >
                                  CREATE PLAYLIST
                                </div>
                              </Row>
                              <Row>
                                <button id='config-start-btn' className="mayhem-btn-blue btn-full-width" style={{display: 'none'}} >
                                  {updatingGame ? 'STARTING...' : 'START GAME'}
                                </button>
                              </Row>
                              <br />
                              <a
                                style={{
                                  color: 'white',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  textDecoration: 'underline',
                                }}
                                onClick={() => {
                                  this.resetGame()
                                }}
                              >
                                RESET GAME?
                              </a>
                              {showBackgroundMusicControl && (
                                <BackgroundMusicControl volumeChange={t => this.volumeButton(t)} />
                              )}
                            </div>
                          )}
                          {standardTriviaMode && <StandardTriviaForm textField={renderTextField} startTrivia={this.startTrivia} {...this.props} />}
                          {mayhemMatesMode && <MayhemMatesForm {...this.props} />}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </form>
          </Container>
        )}
        {gameOverScreen && <GameOverScreen resetGameFromOverScreen={val => this.resetGame(val)} configScreen />}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    changeFieldValue: (field, value) => {
      dispatch(change('updatedGameForm', field, value))
    },
    createPlayer: params => dispatch(createPlayer(params)),
    checkUserIsLogin: params => dispatch(checkUserIsLogin(params)),
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
    instantRequest: (path, params) => dispatch(instantRequest(path, params)),
    clearState: () => dispatch(clearState()),
    updateGame: params => dispatch(updateGame(params)),
  }
}

const GameForm = reduxForm({
  form: 'updatedGameForm',
  enableReinitialize: true,
  validate,
})(GameConfiguration)

const selector = formValueSelector('updatedGameForm')

export default connect(
  state => {
    const playlist_id = selector(state, 'game.playlist_id')
    const song_count = selector(state, 'game.song_count')
    const profile = selector(state, 'game.profile')
    const trivia_url = selector(state, 'game.trivia_url')
    const campaign_id = selector(state, 'game.campaign_id')
    const background_music = selector(state, 'game.background_music')
    const background_music_playlist = selector(state, 'game.background_music_playlist')
    const random_play = selector(state, 'game.random_play')
    return {
      playlist_id,
      song_count,
      profile,
      trivia_url,
      campaign_id,
      background_music,
      background_music_playlist,
      random_play,
      auth: state.auth,
      game: state.game,
      player: state.player,
      initialValues: {
        game: {
          automatic_round_advance: false,
          timer: 1,
          profile: 'Default',
          show_scoreboard: false,
          random_play: true,
        },
      },
    }
  },
  mapDispatchToProps
)(GameForm)
