/* global setTimeout document Element window localStorage console */
import React from 'react'
import HostGameTimer from './HostGameTimer'
import { connect } from 'react-redux'
import pusher from '../constants/pusher'
import GameScreenBig from './GameScreenBig'
import QAGameScreenBig from './QAGameScreenBig'
import Leaderboard from './Leaderboard'
import Advertisement from './Advertisement'
import FinalLeaderboard from './FinalLeaderboard'
import DemoGuessScreen from './DemoGuessScreen'
import DemoSongEnd from './DemoSongEnd'
import GameOverScreen from './GameOverScreen'
import SpinWheel from './SpinWheel'
import * as actions from '../actions/hostGameActions'
import { updatePusherRequest } from '../actions/pusherActions'
import { checkUserIsLogin } from '../actions/loginActions'
import Timer from './Timer'
import Swal from 'sweetalert2'
import SlotMachine from './slotMachine/SlotMachine'
import { postRequest, instantRequest } from '../actions/gameAction'
import { GET_SONG_DATA, UPDATE_APPLIANCE } from '../constants/gameConstants'
import { changeSongVolume, songFadeOut } from '../components/helper'
import ScreenRouter from './ScreenRouter'

class MusicMayhemGame extends React.Component {
  state = {
    beginGame: false,
    gameOver: false,
    songsLoaded: false,
    demoGame: false,
    songSkipped: false,
    slotMachine: false,
    pusherCurrentSongCount: null,
    gameId: null,
    enableSplash: false,
    showPpt: false,
    guessActive: false,
    roundStartingAudio: true,
    scoreboardDuration: null,
    scoreboardUrl: null,
    gameEnded: false,
    spinWheel: false,
    playerNames: null,
    wheelType: null,
    isQA: false
  }

  UNSAFE_componentWillMount() {
    if (this.props.match.params.game_code.length === 3) {
      this.props.dispatch(checkUserIsLogin()).then(res => {
        if (res.account && res.account.role == "host") {
          this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))
          this.checkVideoPlay()
        } else {
          const game_code = this.props.match.params.game_code
          this.props.history.push('/players/' + game_code)
          window.location = '/players/' + game_code
        }
      })
    }
    if (this.props.game && this.props.game.game && this._accountRole == 'host')
      this.props.dispatch(actions.updateGameRequest({ state: 'Starting Game', code: this.props.game.game.code }))
  }

  componentDidMount() {
    document.getElementsByTagName('body')[0].style.paddingTop = '5rem'
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { game } = nextProps
    if (game && game.songSkipped && game.rounds && game.state == 'Starting Game' && !this.state.songSkipped) {
      let element = document.getElementById('songPlayer')
      if (element) element.parentNode.removeChild(element)
      window.clearInterval(window.timeInteval)
      window.clearInterval(window.updateInterval)
      this.setState({ songSkipped: true })
      this.props.dispatch(actions.startingRoundServer({ round: nextProps.game.rounds }))
    }
    if (nextProps.auth.currentAccount && game.game && nextProps.auth.currentAccount.id != game.game.account_id) {
      const game_code = this.props.match.params.game_code
      this.props.history.push('/player/' + game_code)
      window.location = '/player/' + game_code
    }
    if (this.props.auth && this.props.auth.currentAccount && this.props.auth.currentAccount.role)
      this._accountRole = nextProps.auth.currentAccount.role

    if (!this.props.game.game && game.game) {
      const profile = game.current_profile
      console.log(profile)
      this.setState({
        gameId: game.game.id,
        enableSplash: profile.enable_splash,
        splashUrl: profile.splash_url,
        splashDuration: profile.splash_duration,
        roundStartingAudio: profile.round_starting_audio,
        scoreboardDuration: profile.scoreboard_duration,
        isQA: profile.name.includes('QA'), 
      })
      this.loadGameData(game)
      if (game.game.state == 'Game Over') {
        this.setState({ beginGame: true })
        this.props.dispatch(actions.updateGameRequest({ state: game.game.state, code: game.game.code }))
      } else {
        if (game.game.name == 'demo') this.setState({ demoGame: true })
        this.props.dispatch(actions.updateGameRequest({ state: 'Starting Game', code: game.game.code }))
      }
    }
    if (
      game &&
      game.rounds &&
      game.rounds.song_order_ids &&
      game.rounds.song_order_ids.length > 0 &&
      game.startedRound &&
      this.props.game.state == 'Starting Game'
    ) {
      if (game.already_played_song_ids.length == 0) {
        let currentSong = game.rounds.song_order_ids.shift()
        this.props.dispatch(
          actions.loadSong({ song: { id: currentSong }, game: game.game.code, song_ids: game.rounds.song_order_ids })
        )
      } else {
        if (game.rounds.song_order_ids.filter(x => game.already_played_song_ids.indexOf(x) === -1).length == 0) {
          this.props.dispatch(actions.updateGameRequest({ state: 'Game Over', code: game.game.code }))
        } else if (game.rounds.song_order_ids.toString() == game.already_played_song_ids.toString()) {
          this.props.dispatch(actions.updateGameRequest({ state: 'Game Over', code: game.game.code }))
        } else {
          game.rounds.song_order_ids = game.rounds.song_order_ids.map(Number)
          game.rounds.song_order_ids = game.rounds.song_order_ids.filter(
            x => game.already_played_song_ids.indexOf(x) === -1
          )
          let currentSong = game.rounds.song_order_ids.shift()
          this.props.dispatch(
            actions.loadSong({ song: { id: currentSong }, game: game.game.code, song_ids: game.rounds.song_order_ids })
          )
        }
      }
    }
    if (
      nextProps.pusher &&
      nextProps.pusher.pusherData &&
      nextProps.pusher.pusherData.currentSong &&
      Object.keys(nextProps.pusher.pusherData.currentSong).length > 0
    )
      this.setState({ songsLoaded: false })

    if (
      nextProps.pusher &&
      nextProps.pusher.pusherData &&
      nextProps.pusher.pusherData.currentSong == '' &&
      nextProps.pusher.pusherData.state == 'song_ended' &&
      !this.state.songsLoaded
    ) {
      if (game && game.song_order_ids && game.song_order_ids.length == 1) this._lastSongOfGame = true

      this.setState({ songsLoaded: true })
      let loaded_song_id = game.song_order_ids.shift()
      this.props.dispatch(
        actions.loadSong({ song: { id: loaded_song_id }, game: game.game.code, song_ids: game.song_order_ids })
      )
    }

    // if (
    //   game &&
    //   game.game &&
    //   game.game.campaign_id != null &&
    //   game.song_order_ids &&
    //   game.song_order_ids.length == 0 &&
    //   nextProps.pusher.pusherData &&
    //   nextProps.pusher.pusherData.state &&
    //   nextProps.pusher.pusherData.state == 'show_ad_camp' &&
    //   !this.state.gameOver
    // ) {
    //   this.setState({ gameOver: true })
    //   setTimeout(() => {
    //     this.props.dispatch(actions.updateGameRequest({ state: 'Game Over', code: game.game.code }))
    //   }, 13000)
    // }
    // if (
    //   game &&
    //   game.game &&
    //   game.game.campaign_id == null &&
    //   game.game.open_session == false &&
    //   game.song_order_ids &&
    //   game.song_order_ids.length == 0 &&
    //   nextProps.pusher.pusherData &&
    //   nextProps.pusher.pusherData.state &&
    //   nextProps.pusher.pusherData.state == 'showing_leaderboard' &&
    //   !this.state.gameOver
    // ) {
    //   this.setState({ gameOver: true })
    //   setTimeout(() => {
    //     this.props.dispatch(actions.updateGameRequest({ state: 'Game Over', code: game.game.code }))
    //   }, 17000)
    // }
    if(nextProps.game && nextProps.game.appliance_updated){
      window.location.reload()
    }
    if(!this.state.scoreboardUrl && game && game.series_name)
      this.setState({ scoreboardUrl: window.location.origin+'/series/'+game.series_name })
  }

  componentDidUpdate() {
    this.checkVideoPlay()
  }

  componentWillUnmount() {
    document.getElementsByTagName('body')[0].style.paddingTop = '0rem'
  }

  _lastSongOfGame = false
  _openSession = false
  _skipSelectedSong = false
  _accountRole = false
  _spiffValue = null
  _campaignUpdated = false

  checkVideoPlay() {
    if (
      document.querySelector('.video-background > video') &&
      document.querySelector('.video-background > video').ended
    )
      document.querySelector('.video-background > video').play()
  }
  isQAGame = () => {
    if (!this.props.game.game && game.game) {
      const profile = game.current_profile
      console.log(profile)
      if (profile.name.includes('QA')) return true
    }
    return false
  }

  loadGameData(gameData) {
    if (gameData.game) {
      let channel_name = 'games_' + gameData.game.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('game_event', data => {
        console.log(data.type)
        switch (data.type) {
          case 'set_current_round':
            this.props.dispatch(updatePusherRequest({ rounds: data.data, state: data.type }))
            break
          case 'song_loaded':
            this.setState({ pusherCurrentSongCount: data.data.song_of_songs_count})
            if (this.props.game.game.open_session) this._openSession = true

            this.setState({ songSkipped: false })
            this.props.dispatch(
              updatePusherRequest({
                currentSong: data.data.loaded_song,
                loadedSong: data.data.loaded_song,
                reveal_seq_array: data.data.reveal_seq_array,
                state: data.type,
              })
            )
            break
          case 'showing_leaderboard':
            this.setState({ pusherCurrentSongCount: data.data.song_of_songs_count })
            if (this._skipSelectedSong) {
              this._skipSelectedSong = false
              this.props.dispatch(
                postRequest('games/skip_song_data', {
                  type: GET_SONG_DATA,
                  values: { game: { code: this.props.match.params.game_code } },
                })
              )
            }
            if (this.props.game.song_order_ids && this.props.game.song_order_ids.length == 0)
              this._lastSongOfGame = true

            if (this.props.game.game.reset_round) {
              this.props.dispatch(
                updatePusherRequest({
                  currentSongScores: data.data.currentSongScores,
                  leaderboard: data.data.roundScores,
                  state: data.type,
                })
              )
            } else {
              this.props.dispatch(
                updatePusherRequest({
                  currentSongScores: data.data.currentSongScores,
                  leaderboard: data.data.leaderboard,
                  player1: data.data.player1,
                  player11: data.data.player11,
                  state: data.type,
                })
              )
            }
            if (this._campaignUpdated) {
              this.updateAppliance()
            }
            break
          case 'show_ad_camp':
            this.props.dispatch(
              updatePusherRequest({
                assetsUrl: data.data.assets_url,
                leaderboard: data.data.leaderboard,
                state: data.type,
                advDuration: data.data.adv_duration * 1000,
              })
            )
            break
          case 'song_ended':
            this.props.dispatch(updatePusherRequest({ currentSong: '', state: data.type}))
            break
          case 'game_ended':
            this.setState({ slotMachine: false, gameEnded: true, spinWheel: false })
            if (data.data.remote)
              this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))

            this.props.dispatch(updatePusherRequest({ leaderboard: data.data.leaderboard, state: data.type }))
            break
          case 'active_song':
            this.setState({ songSkipped: false, pusherCurrentSongCount: data.song_count, guessActive: true })
            break
          case 'new_round_added':
            songFadeOut()
            setTimeout(() => {
              window.location = data.data
            }, 10000)
            break
          case 'start_new_game':
            window.location = data.data
            break
          case 'game_updated':
            if (!data.update) localStorage['game_updated'] = true

            window.location = data.data
            break
          case 'first_player_added':
            if (window.location.pathname.includes('games') && data.account) {
              Swal({
                position: 'bottom-right',
                width: 400,
                showCloseButton: true,
                backdrop: 'rgba(0,0,123,0.4)',
                text: `Now Selecting Playlist: ${data.p_name}`,
                showConfirmButton: false,
                imageUrl: `${data.p_logo}`,
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                animation: false,
                timer: 50000,
              })
            }
            if (this.props.game && this.props.game.game && !this.props.game.game.passive_mode)
              if (document.getElementById('start-btn')) document.getElementById('start-btn').click()

            break
          case 'volume_up':
            changeSongVolume('volume_up')
            break
          case 'volume_down':
            changeSongVolume('volume_down')
            break
          case 'volume_bcg_up':
            changeSongVolume('volume_bcg_up')
            break
          case 'volume_bcg_down':
            changeSongVolume('volume_bcg_down')
            break
          case 'skip_song':
            window.clearInterval(window.timeInteval)
            window.clearInterval(window.updateInterval)
            this._skipSelectedSong = true
            this.props.dispatch(actions.resetGameData())
            this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))
            pusher.unsubscribe('games_' + this.state.gameId)
            break
          case 'reload_game':
            window.clearInterval(window.timeInteval)
            window.clearInterval(window.updateInterval)
            this.props.dispatch(actions.resetGameData())
            this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))
            pusher.unsubscribe('games_' + this.state.gameId)
            break
          case 'advance_next_song':
            if (document.getElementById('next-song-btn')) document.getElementById('next-song-btn').click()

            break
          case 'set_playlist_by_player':
            if (window.location.pathname.includes('games')) {
              Swal({
                position: 'bottom-right',
                width: 400,
                showCloseButton: true,
                backdrop: 'rgba(0,0,123,0.4)',
                text: `Now Selecting Playlist: ${data.p_name}`,
                showConfirmButton: false,
                imageUrl: `${data.p_logo}`,
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                animation: false,
                timer: 50000,
              })
            }
            break
          case 'slot_machine':
            this._spiffValue = data.spiff_value
            this.setState({ slotMachine: true, showPpt: false, spinWheel: false })
            break
          case 'close_slot_machine':
            this.setState({ slotMachine: false, showPpt: false, spinWheel: false })
            break
          case 'respin_slot_machine':
            this._spiffValue = data.spiff_value
            this.setState({ slotMachine: false })
            this.setState({ slotMachine: true })
            break
          case 'open_spin_wheel':
            this.setState({ spinWheel: true, showPpt: false, slotMachine: false, wheelType: data.data.wheel_type, playerNames: data.data.player_names })
            break
          case 'start_spin_wheel':
            if(this.refs.SpinWheel) this.refs.SpinWheel.spin(data.data.random_spin)
            setTimeout(() => {
              this.setState({ spinWheel: false, showPpt: false, slotMachine: false })
            }, 25000)
            break
          case 'close_spin_wheel':
            this.setState({ spinWheel: false, showPpt: false, slotMachine: false })
            break
          case 'skip_selected_song':
            this._skipSelectedSong = true
            break
          case 'update_players_selected_playlist':
            if (this.props.game.game && this.props.game.game.jukebox_mode) {
              localStorage['game_updated'] = true
              window.location.reload()
            }
            Swal.close()
            break
          case 'standard_trivia_started':
            window.location = '/trivia/' + this.props.match.params.game_code
            break
          case 'mayhem_mates_started':
            window.location = '/mayhem_mates/' + this.props.match.params.game_code
            break
          case 'standard_trivia_ended':
          case 'mayhem_mates_ended':
            window.location = '/games/' + this.props.match.params.game_code
            break
          case 'page_refresh':
            window.location.reload()
            break
          case 'ask_player_continue':
            setTimeout(() => {
              this.props.dispatch(
                postRequest('games/pusher_update', {
                  values: { game: { code: this.props.game.game.code, status: 'gameOver' } },
                })
              )
            }, 35000)
            break
          case 'start_next_round':
            this.props.dispatch(actions.addNewRound({ game: { code: this.props.game.game.code } }))
            localStorage['game_updated'] = true
            break
          case 'show_ppt':
            this.setState({ showPpt: true, slotMachine: false })
            break
          case 'guess_end':
            this.setState({ guessActive: false })
            break
          case 'campaign_updated':
            if(!this.state.guessActive && (data.data.jukebox || this.props.game.game && this.props.game.game.jukebox_mode)) this.updateAppliance()
            else this._campaignUpdated = true
           break
          case 'mirror_pushed':
            if(data.data.game_code != this.props.game.game.code )
              window.location = '/mirror/' + data.data.game_code
           break
        }
      })
    }
  }

  toggleFullScreen() {
    if (
      (document.fullScreenElement && document.fullScreenElement !== null) || // alternative standard method
      (!document.mozFullScreen && !document.webkitIsFullScreen)
    ) {
      // current working methods
      if (document.documentElement.requestFullScreen) document.documentElement.requestFullScreen()
      else if (document.documentElement.mozRequestFullScreen) document.documentElement.mozRequestFullScreen()
      else if (document.documentElement.webkitRequestFullScreen)
        document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)

      document.getElementById('full-btn').innerText = 'Exit Fullscreen'
    } else {
      if (document.cancelFullScreen) document.cancelFullScreen()
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen()
      else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen()

      document.getElementById('full-btn').innerText = 'Fullscreen'
    }
  }

  updateAppliance(){
    this._campaignUpdated = false
    this.props.dispatch(
      postRequest('games/update_appliance', {
        type: UPDATE_APPLIANCE,
        values: { game: { code: this.props.match.params.game_code } },
      })
    )
  }

  mayhemSpinnerUpdate = (result) => {
    if(result !== 'Pass'){
      this.props.dispatch(
        instantRequest('games/mayhem_spinner_update', {
          values: { game: { code: this.props.match.params.game_code }, result: result },
        })
      )
    }
  }

  render() {
    const {
      demoGame,
      slotMachine,
      beginGame,
      pusherCurrentSongCount,
      enableSplash,
      splashDuration,
      splashUrl,
      showPpt,
      roundStartingAudio,
      scoreboardDuration,
      scoreboardUrl,
      gameEnded,
      spinWheel,
      playerNames,
      wheelType,
      isQA,
    } = this.state
    const { game, pusher } = this.props
    const gameScreenBigConditons =
      beginGame &&
      !game.loadingSong &&
      pusher.pusherData &&
      game.state == 'Song Loaded' &&
      pusher.pusherData &&
      pusher.pusherData.reveal_seq_array &&
      pusher.pusherData.reveal_seq_array.title &&
      pusher.pusherData.reveal_seq_array.artist &&
      pusher.pusherData.reveal_seq_array.title.length > 0 &&
      pusher.pusherData.reveal_seq_array.artist.length > 0
    return (
      <div className="video-background">
        {slotMachine && <SlotMachine {...this.props} spiffValue={this._spiffValue} />}
        {spinWheel && <SpinWheel ref="SpinWheel" wheelType={wheelType} playerNames={playerNames && playerNames.length > 0 ? playerNames : null} mayhemSpinnerUpdate={this.mayhemSpinnerUpdate}/>}
        {showPpt && (
          <Advertisement
            flashppt
            assetsUrl={[
              [],
              [
                'https://docs.google.com/presentation/d/e/2PACX-1vQeBFEFtM6RXSCR1qiT7HvxGwmD5DTpmg1QUH4tVTgBJgTAvDSewK9NJC-mmDIiHe9fJPWS1Ah12hUN/embed?start=true&loop=false&delayms=3000&slide=id.p',
              ],
            ]}
            gameCode={game.game.code}
            game_code_display={game.game.game_code_display}
          />
        )}
        {!demoGame && (
          <div style={{ opacity: !(slotMachine || showPpt || spinWheel) ? 1 : 0 }}>
            {!beginGame && game.state == 'Starting Game' && (
              <HostGameTimer
                gameEnded={gameEnded}
                splash={{ enable: enableSplash, duration: splashDuration, url: splashUrl }}
                scoreboard={{showScoreboard: game.game.show_scoreboard ,scoreboardDuration: scoreboardDuration, scoreboardUrl: scoreboardUrl}}
                roundStartingAudio={{ enable: roundStartingAudio}}
                songsUrl={game.songs_url}
                beginGame={value => this.setState({ beginGame: value })}
              />
            )}
            {gameScreenBigConditons && ( 
                <ScreenRouter
              game={{
                  currentSong: game.loaded_song,
                  songCount: pusherCurrentSongCount ? pusherCurrentSongCount : this.props.game.game.song_of_songs_count,
                  seq: {
                    title: pusher.pusherData.reveal_seq_array.title,
                    artist: pusher.pusherData.reveal_seq_array.artist,
                  },
                  gameCode: game.game.code,
                  time: game.rounds.settings.guess_timer,
                  points: game.rounds.settings.point_value,
                  songPlayTime: game.rounds.settings.song_play_time,
                  songName: game.loaded_song.title,
                  artist: game.loaded_song.artist,
                  songStartTime: 0,
                  songLink: game.loaded_song.public_url,
                  show_title_hint: game.game.show_title_hint,
                  show_artist_hint: game.game.show_artist_hint,
                  show_year_hint: game.game.show_year_hint,
                  campaign_id: game.game.campaign_id,
                  game_code_display: game.game.game_code_display,
                  isQA: isQA,
                }}
              />
            )}
            {beginGame && game.state == 'Showing LeaderBoard' && (
              <Leaderboard
                openSession={game.game.open_session}
                lastSongOfGame={this._lastSongOfGame}
                automaticSongAdvance={game.game.automatic_song_advance}
                gameCode={game.game.code}
                loadedSong={game.loaded_song}
                songCount={pusherCurrentSongCount ? pusherCurrentSongCount : this.props.game.game.song_of_songs_count}
                leaderboard={pusher.pusherData.leaderboard}
                currentSongScores={pusher.pusherData.currentSongScores}
                player1={pusher.pusherData.player1}
                game_code_display={game.game.game_code_display}
                round_leaderboard={game.game.round_leaderboard}
                // player11={pusher.pusherData.player11} /*11th place at song leaderboard*/
              />
            )}
            {beginGame &&
              pusher &&
              pusher.pusherData &&
              pusher.pusherData.advDuration &&
              pusher.pusherData.state == 'show_ad_camp' && (
                <Advertisement
                  assetsUrl={pusher.pusherData.assetsUrl}
                  gameCode={game.game.code}
                  advDuration={pusher.pusherData.advDuration}
                  game_code_display={game.game.game_code_display}
                />
              )}
            {(beginGame || gameEnded) && game.state == 'Game Over' && <FinalLeaderboard gameCode={game.game.code} />}
          </div>
        )}
        {demoGame && (
          <div>
            {!beginGame && (
              <Timer
                time={0.2}
                demo={true}
                game={game}
                data={'Demo game will start in'}
                position="no-position"
                beginGame={value => this.setState({ beginGame: value })}
              />
            )}
            {gameScreenBigConditons && (
              <GameScreenBig
                demo={true}
                game={{
                  currentSong: game.loaded_song,
                  songCount: pusherCurrentSongCount ? pusherCurrentSongCount : this.props.game.game.song_of_songs_count,
                  seq: {
                    title: pusher.pusherData.reveal_seq_array.title,
                    artist: pusher.pusherData.reveal_seq_array.artist,
                  },
                  gameCode: game.game.code,
                  time: game.rounds.settings.guess_timer,
                  points: game.rounds.settings.point_value,
                  songPlayTime: game.rounds.settings.song_play_time,
                  songName: game.loaded_song.title,
                  artist: game.loaded_song.artist,
                  songStartTime: 0,
                  songLink: game.loaded_song.public_url,
                  show_title_hint: game.game.show_title_hint,
                  show_artist_hint: game.game.show_artist_hint,
                  show_year_hint: game.game.show_year_hint,
                  game_code_display: game.game.game_code_display,
                }}
              />
            )}
            {gameScreenBigConditons && <DemoGuessScreen game={game.game} />}
            {beginGame && game.state == 'Showing LeaderBoard' && (
              <DemoSongEnd
                game={game.game}
                currentSongScores={pusher.pusherData.currentSongScores}
                loadedSong={game.loaded_song}
              />
            )}
            {beginGame && game.state == 'Game Over' && <GameOverScreen />}
          </div>
        )}
      </div>
    )
  }
}

function mapStateToProps(store) {
  return {
    auth: store.auth,
    game: store.game,
    pusher: store.pusher,
  }
}

export default connect(mapStateToProps)(MusicMayhemGame)
