/* global window */
import React from 'react'
import { postRequest } from '../../actions/gameAction'
import pusher from '../../constants/pusher'
// import { checkUserIsLogin } from '../../actions/loginActions'
import { connect } from 'react-redux'
import { GET_MIRROR_DATA } from '../../constants/mirror'
import GameTimer from './GameTimer'
import MirrorTilesScreen from './MirrorTilesScreen'
import Leaderboard from '../Leaderboard'
import Advertisement from '.././Advertisement'
import SpinWheel from '.././SpinWheel'
import MirrorFinalLeaderboard from './MirrorFinalLeaderboard'
import MirrorSlotMachine from './MirrorSlotMachine'
import { instantRequest } from '../../actions/gameAction'
import Swal from 'sweetalert2'
import { songFadeOut } from '../../components/helper'
let CODE = window.location.pathname.split('/')[2]

class MusicMayhemMirror extends React.Component {
  state = {
    gameBegin: false,
    showTilesScreen: false,
    showAdScreen: false,
    showLeaderboardScreen: false,
    showGameOverScreen: false,
    slotMachine: false,
    showPpt: false,
    enableSplash: false,
    roundStartingAudio: true,
    scoreboardDuration: null,
    scoreboardUrl: null,
    spinWheel: false,
    playerNames: null,
    wheelType: null,
  }
  UNSAFE_componentWillMount() {
    // this.props.dispatch(checkUserIsLogin()).then(res => {
    //   if (!res || (res && res.account && res.account.role != 'host')) {
    //     this.props.history.push('/')
    //   } else {
    //     CODE = this.props.match.params.game_code
    //     this.props.dispatch(postRequest('mirror/mirror_data', { type: GET_MIRROR_DATA, values: { code: CODE } }))
    //   }
    // })
    CODE = this.props.match.params.game_code
    this.props.dispatch(postRequest('mirror/mirror_data', { type: GET_MIRROR_DATA, values: { code: CODE } }))
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (!this.props.mirror.data && np.mirror.data) {
      const profile = np.mirror.current_profile
      this.setState({
        gameId: np.mirror.game.id,
        enableSplash: profile.enable_splash,
        splashUrl: profile.splash_url,
        splashDuration: profile.splash_duration,
        roundStartingAudio: profile.round_starting_audio,
        scoreboardDuration: profile.scoreboard_duration,
      })
      if (np.mirror.game.state == 'Game Over') {
        this.mirrorGameOver()
      }
      this.mirrorPusherData(np.mirror.game)
    }
    if(!this.state.scoreboardUrl && np.mirror && np.mirror.series_name)
      this.setState({ scoreboardUrl: window.location.origin+'/series/'+np.mirror.series_name })
  }

  mirrorPusherData(gameData) {
    if (gameData) {
      let channel_name = 'games_' + gameData.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('game_event', data => {
        console.log(data.type)
        switch (data.type) {
          case 'active_song':
            this.setState({ activeSong: true })
            break
          case 'set_current_round':
            break
          case 'song_loaded':
            this.setState({
              tilesData: data.data,
              showTilesScreen: true,
              showLeaderboardScreen: false,
              showAdScreen: false,
              activeSong: false,
            })
            break
          case 'page_refresh':
            window.location.reload()
            break
          case 'skip_song':
            var element = document.getElementById('songPlayer')
            if (element) element.parentNode.removeChild(element)
            window.clearInterval(window.timeInteval)
            window.clearInterval(window.updateInterval)
            this.setState({ showTilesScreen: false, tilesData: null })
            pusher.unsubscribe('games_' + this.state.gameId)
            this.setState({ showTilesScreen: true })
            break
          case 'showing_leaderboard':
            this.setState({
              leaderboardData: data.data,
              showTilesScreen: false,
              showLeaderboardScreen: true,
              showAdScreen: false,
            })
            break
          case 'new_round_added':
            songFadeOut()
            setTimeout(() => {
              window.location.reload()
            }, 10000)
            break
          case 'show_ad_camp':
            this.setState({ showTilesScreen: false, showLeaderboardScreen: false, showAdScreen: true })
            break
          case 'game_ended':
            this.mirrorGameOver()
            break
          case 'start_new_game':
            var new_url = data.data.replace('/games/', '/mirror/')
            window.location = new_url
            break
          case 'game_updated':
            if (!data.update) localStorage['game_updated'] = true

            window.location.reload()
            break
          case 'slot_machine':
            this.setState({ slotMachine: true, showPpt: false, spinWheel: false })
            break
          case 'close_slot_machine':
            this.setState({ slotMachine: false, winnerTicket: null, showPpt: false, spinWheel: false })
            break
          case 'respin_slot_machine':
            this.setState({ slotMachine: false })
            this.setState({ slotMachine: true, winnerTicket: null })
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
          case 'ticket_number':
            this.setState({ winnerTicket: data.data })
            break
          case 'first_player_added':
            if (window.location.pathname.includes('mirror') && data.account) {
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
            if (this.props.mirror && this.props.mirror.game && !this.props.mirror.game.passive_mode)
              if (document.getElementById('start-btn')) document.getElementById('start-btn').click()

            break
          case 'start_next_round':
            localStorage['game_updated'] = true
            break
          case 'update_players_selected_playlist':
            if (this.props.mirror.game && this.props.mirror.game.jukebox_mode) {
              localStorage['game_updated'] = true
              window.location.reload()
            }
            Swal.close()
            break
          case 'set_playlist_by_player':
            if (window.location.pathname.includes('mirror')) {
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
          case 'show_ppt':
            this.setState({ showPpt: true, slotMachine: false })
            break
          case 'mirror_ended':
            this.props.history.goBack()
           break
        }
      })
    }
  }

  mirrorGameOver(){
  this.props
    .dispatch(
      instantRequest('mirror/game_over_data', {
        values: { code: CODE },
      })
    )
    .then(res => {
      this.setState({
        showGameOverScreen: true,
        showTilesScreen: false,
        showLeaderboardScreen: false,
        showAdScreen: false,
        gameOverData: res.leaderboardData,
        gameBegin: true,
        spinWheel: false,
      })
    })
  }

  render() {
    const { game, advertise_images, advertise_time } = this.props.mirror
    const {
      gameBegin,
      showTilesScreen,
      showAdScreen,
      showLeaderboardScreen,
      leaderboardData,
      tilesData,
      activeSong,
      showGameOverScreen,
      gameOverData,
      slotMachine,
      winnerTicket,
      showPpt,
      enableSplash,
      splashDuration,
      splashUrl,
      roundStartingAudio,
      scoreboardDuration,
      scoreboardUrl,
      spinWheel,
      playerNames,
      wheelType,
    } = this.state
    const tileScreenCondtion = gameBegin && showTilesScreen && tilesData
    const leaderboardCondition = gameBegin && game && showLeaderboardScreen
    const campCondition = gameBegin && showAdScreen
    return (
      <div className="video-background">
        {slotMachine && winnerTicket && <MirrorSlotMachine number={winnerTicket} />}
        {spinWheel && <SpinWheel ref="SpinWheel" wheelType={wheelType} playerNames={playerNames && playerNames.length > 0 ? playerNames : null}  mirror/>}
        {showPpt && (
          <Advertisement
            flashppt
            assetsUrl={[
              [],
              [
                'https://docs.google.com/presentation/d/e/2PACX-1vQeBFEFtM6RXSCR1qiT7HvxGwmD5DTpmg1QUH4tVTgBJgTAvDSewK9NJC-mmDIiHe9fJPWS1Ah12hUN/embed?start=true&loop=false&delayms=3000&slide=id.p',
              ],
            ]}
            gameCode={CODE}
            game_code_display={game.game_code_display}
          />
        )}
        <div style={{ opacity: !(slotMachine || showPpt || spinWheel) ? 1 : 0 }}>
          {!gameBegin && game && (game.state == 'Starting Game' || 'Game Updated') && (
            <GameTimer
              {...this.props.mirror}
              splash={{ enable: enableSplash, duration: splashDuration, url: splashUrl }}
              scoreboard={{showScoreboard: game.show_scoreboard ,scoreboardDuration: scoreboardDuration, scoreboardUrl: scoreboardUrl}}
              roundStartingAudio={{ enable: roundStartingAudio}}
              gameBegin={value => this.setState({ gameBegin: value })}
            />
          )}
          {tileScreenCondtion && (
            <MirrorTilesScreen
              mirror
              game={{
                activeSong,
                currentSong: tilesData.loaded_song,
                songCount: tilesData.song_of_songs_count,
                seq: {
                  title: tilesData.reveal_seq_array.title,
                  artist: tilesData.reveal_seq_array.artist,
                },
                gameCode: CODE,
                time: parseInt(tilesData.setting.guess_timer),
                points: parseInt(tilesData.setting.point_value),
                songPlayTime: parseInt(tilesData.setting.song_play_time),
                songName: tilesData.loaded_song.title,
                artist: tilesData.loaded_song.artist,
                songStartTime: 0,
                songLink: tilesData.loaded_song.public_url,
                show_title_hint: game.show_title_hint,
                show_artist_hint: game.show_artist_hint,
                show_year_hint: game.show_year_hint,
                game_code_display: game.game_code_display,
              }}
            />
          )}
          {leaderboardCondition && (
            <Leaderboard
              mirror
              campaign_id={game.campaign_id}
              openSession={game.open_session}
              automaticSongAdvance={game.automatic_song_advance}
              lastSongOfGame={false}
              gameCode={CODE}
              loadedSong={leaderboardData.loaded_song}
              songCount={leaderboardData.song_of_songs_count}
              leaderboard={leaderboardData.leaderboard}
              currentSongScores={leaderboardData.currentSongScores}
              player1={leaderboardData.player1}
              game_code_display={game.game_code_display}
              round_leaderboard={game.round_leaderboard}
              // player11={leaderboardData.player11} /*11th place at song leaderboard*/
            />
          )}
          {campCondition && (
            <Advertisement mirror assetsUrl={advertise_images} advDuration={advertise_time} gameCode={CODE} game_code_display={game.game_code_display} />
          )}
          {showGameOverScreen && (
            <MirrorFinalLeaderboard
              settings={gameOverData.settings}
              code={CODE}
              openSession={game.open_session}
              jukeboxMode={game.jukebox_mode}
              autoRoundAdvance={game.automatic_round_advance}
              leaderboard={gameOverData.leaderboard}
              game_code_display={game.game_code_display}
              gameOverLeaderboard={game.game_over_leaderboard}
            />
          )}
        </div>
      </div>
    )
  }
}

function mapStateToProps(store) {
  return {
    mirror: store.mirror,
  }
}

export default connect(mapStateToProps)(MusicMayhemMirror)
