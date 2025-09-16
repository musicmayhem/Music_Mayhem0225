/* global setTimeout window localStorage location */
import React from 'react'
import { connect } from 'react-redux'
import pusher from '../constants/pusher'
import RegistrationWelcome from './RegistrationWelcome'
import PlayerWelcomeScreen from './PlayerWelcomeScreen'
import PlayerGuessScreen from './PlayerGuessScreen'
import PlayerSongEnd from './PlayerSongEnd'
import PlayerGameEnd from './PlayerGameEnd'
import GameOverScreen from './GameOverScreen'
import ClientAdvScreen from './ClientAdvScreen'
import * as actions from '../actions/hostGameActions'
import { updatePlayerPusherRequest, checkPlayerPresent, checkPlayerName } from '../actions/playerActions'
import { checkUserIsLogin } from '../actions/loginActions'
import { postRequest, makeRequest, gamePlayers } from '../actions/gameAction'
import { GET_HOST_PLAYLIST, PLAYER_SONGS_PLAYED, UPDATE_PLAYERS_PICKS } from '../constants/playerConstants'
import Swal from 'sweetalert2'
import { REWARDS, UNMUTE } from '../constants/accountConstants'
import Rewards from './Rewards'
import Tickets from '../components/PPTS/Tickets'
import Picks from '../components/PPTS/Picks'
import Spiffs from '../components/PPTS/Spiffs'
import StandardTriviaClient from './StandardTriviaClient'
import MayhemMatesClient from './MayhemMatesClient'
import ChatModal from './ChatModal'
import { CURRENT_POINTS } from '../constants/gameConstants'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { resetState } from '../actions/guessCheckerActions'
import AdSense from 'react-adsense';

class MusicMayhemClient extends React.Component {
  state = {
    beginGame: false,
    state: '',
    currentSong: '',
    gameOver: false,
    showBoomScreen: false,
    reward: null,
    songState: false,
    openSession: false,
    playerGuessTimerEnd: false,
    allowJoin: false,
    showOnce: false,
    pusherCurrentSongCount: null,
    triviaMode: false,
    mayhemMatesMode: false,
    answerUpdated: false,
    introRedeemed: false,
    leaderboardTime: 15,
    RoundTotalScore: null,
    showChatModal: false,
    gamePlayers: null,
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch(checkUserIsLogin()).then(res => {
      if (res) {
        this.props.dispatch(
          checkPlayerPresent({ game: { code: this.props.match.params.game_code }, player: { account_id: res.account.id } })
        )
        this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))
      }else{
        this.props.history.push('/')
      }
    })
  }

  componentDidMount() {
    this.loadGameData(this.props.game)
    this.loadPlayerGuessData(this.props.game)
    window.addEventListener('focus', this.onFocus)
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if((!this.props.game.rounds ||
       this.state.allowJoin) &&
       this.props.player &&
       this.props.player.player &&
       nextProps.game &&
       !nextProps.game.player_limit_exceeds &&
       nextProps.game.game &&
       nextProps.game.game.game_mode &&
       nextProps.game.game.state !== 'Game Over'
     ){
       if(nextProps.game.game.game_mode == 'Standard trivia')
          this.setState({ triviaMode: true, allowJoin: false })
       else if (nextProps.game.game.game_mode == 'Mayhem Mates')
          this.setState({ mayhemMatesMode: true, allowJoin: false })
     }
    if (
      this.props.player &&
      !this.props.player.getSongCountStatus &&
      nextProps.player.getSongCountStatus &&
      nextProps.game
    )
      this.playerAlert(nextProps)

    if (!this.props.player.host_playlist && nextProps.player.host_playlist) {
      let inputOptions = this.objectify(nextProps.player.host_playlist)
      Swal.fire({
        input: 'select',
        html: 'this window will close in <strong></strong> seconds',
        inputOptions,
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Submit!',
        timer: 50000,
        allowOutsideClick: false,
        onOpen: () => {
          this.getTimer()
        },
      }).then(function(result) {
        nextProps.dispatch(
          postRequest('games/player_playlist', {
            values: { game: { code: nextProps.match.params.game_code, playlist: result.value } },
          })
        )
      })
    }

    if (this.props.player && !this.props.player.player && nextProps.player && nextProps.player.player)
      this.alertsAfterPlayerJoins(nextProps.game)
    if (!this.props.game.game && nextProps.game.game && nextProps.game && nextProps.game.current_profile ) {
      this.loadGameData(nextProps.game)
      this.loadPlayerGuessData(nextProps.game)
      this.setState({ leaderboardTime: nextProps.game.current_profile.leaderboard_display_time })
      // pusher.unsubscribe('games_' + nextProps.game.game.id)
      this.getSongPlayCount()
      if (nextProps.game.state == 'Active Song' || nextProps.game.state == 'Song Loaded') {
        this.setState({ currentSong: 'default', beginGame: true, showBoomScreen: false, songState: true })
        this.props.dispatch(
          updatePlayerPusherRequest({
            currentSong: 'default',
            loadedSong: 'default',
            reveal_seq_array: 'default',
            state: 'song_loaded',
          })
        )
      }
      if (!this.props.game.game && nextProps.game && nextProps.game.game && nextProps.game.game.session_id){
        this.props.dispatch(
          postRequest('player/rewards', { type: REWARDS, values: { session_id: nextProps.game.game.session_id } })
        )
      }
      if (nextProps.game.game.state == 'Game Over' && !this.state.gameOver) this.setState({ gameOver: true })

      this.getCurrentPoint()
    }
  }

  componentWilUnmount() {
    window.removeEventListener('focus', this.onFocus)
  }

  onFocus = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) location.reload()
    else this.props.dispatch(actions.getGameData({ game: { code: this.props.match.params.game_code } }))
  }

  timer = 51
  _showOnce = false
  _spiffValue = null

  PlayerProfile = (player_name, points, song_count) => {
    return (
      <div>
        <div style={{ marginTop: '5rem', padding: '10px' }}>
          <i style={{ fontWeight: 'bold', color: 'white', float: 'left', fontSize: '16px' }}>{player_name}</i>
          <br />
          <h3 style={{ fontWeight: '600', color: '#ffc107', float: 'left', fontSize: '14px' }}>
            ROUND SCORE: <span className="figure">{points || 0}</span>
          </h3>
          {song_count && (
            <div>
              <br />
              <i style={{ fontWeight: 'bold', color: '#ffc107', float: 'left', fontSize: '16px' }}>{song_count}</i>
              <br />
              {/* <AdSense.Google
                client='ca-pub-3018362527059954'
                slot='7806394673' //Please place original slot id
                style={{ width: 500, height: 300, float: 'left' }}
                format=''
              /> */}
            </div>
          )}
        </div>
        {this.props.game && this.props.game.game && this.props.game.game.open_session && (
          <div className="reward-css">
            <Rewards {...this.props} playerScreen musicRound pageState={p => this.setState({ reward: p })} getChatModal={() => this.setState({ showChatModal: true })} />
          </div>
        )}
      </div>
    )
  }

  getTimer() {
    if (this.timer > 1) {
      setTimeout(() => {
        this.timer = this.timer - 1
        if (Swal.getContent() && Swal.getContent().querySelector('strong'))
          Swal.getContent().querySelector('strong').textContent = this.timer

        this.getTimer()
      }, 1000)
    }
  }

  alertsAfterPlayerJoins(game) {
    if (game.current_account_games_played == 0) {
      this.noticeAlert(
        "🤘🏽 WELCOME TO THE MAYHEM! Soon, we'll start playing songs. Guess the artist and title fast as you can.  *Watch for tips and tricks as the game goes on* (tap to close)"
      )
    }
  }

  playerAlert(nextProps) {
    const player_song_play_count = nextProps.player.songPlayCount
    if (player_song_play_count == 11 && nextProps.player.introRedeemed == false && !this.state.introRedeemed)
      this.showIntroAlert()
    if (player_song_play_count == 1) {
      this.noticeAlert(
        '💡 TIP: Enter Artist & Title separately. Guess both answers for more points. 100% accuracy not required'
      )
    }
    if (player_song_play_count == 2)
      this.noticeAlert('💡 TIP: If the game gets stuck, try refreshing your screen, or ask your host for help')
    if (player_song_play_count == 3) this.noticeAlert('⏱ TIP: Faster guesses earn more points')
    if (player_song_play_count == 4) {
      this.noticeAlert(
        '💰 TIP: League play saves your score from week to week and top players win bigger prizes at the end of the season!'
      )
    }
    if (player_song_play_count == 5) {
      this.noticeAlert(
        '🎟 TIP: Tickets also give you a chance to win prizes! Watch for raffles between rounds. Tap the ticket icon ↗️ to see yours'
      )
    }
    if (player_song_play_count == 6) {
      this.noticeAlert(
        '🎟 TIP: You earn a ticket for each round you join, winning 1st place, getting 11th place, or having an 11 in your score! (cuz, we all go to 11 sometimes)'
      )
    }
    if (player_song_play_count == 7) {
      this.noticeAlert(
        "🎸 TIP: Picks give you special powers, and they don't expire like Tickets! Tap the guitar pick icon ↗️ to learn more"
      )
    }
    if (player_song_play_count == 8) {
      this.noticeAlert(
        '🎸 TIP: You earn a Pick for each game you join for correct answers to our Weekly Bonus Question on facebook.com/musicmayhemgame'
      )
    }
    if (player_song_play_count == 9)
      this.noticeAlert('🎤 TIP: Not great at texting? Try Voice To Text (so only your phone hears you)')
    if (player_song_play_count == 10) {
      this.noticeAlert(
        "📢 Did you know we're MN-based? Your feedback helps us get better, so please share your experience or ideas with your host or email us at info@mayhemtrivia.com"
      )
    }
    if (player_song_play_count == 11)
      this.noticeAlert("🔊 Hey-o! You've already racked up 11 songs! You better slow down or you might win something!")
  }

  objectify(array) {
    return array.reduce(function(result, currentArray) {
      result[currentArray[0]] = currentArray[1]
      return result
    }, {})
  }

  getCurrentPoint() {
    this.props.dispatch(
      postRequest('games/current_points', {
        type: CURRENT_POINTS,
        values: { game: { code: this.props.match.params.game_code } },
      })
    )
  }

  showIntroAlert() {
    this.props.dispatch(gamePlayers({ game: { code: this.props.game.game.code } })).then(res => {
      if (res && res.allPlayers && res.allPlayers.length > 0) {
        let gamePlayers = this.objectify(res.allPlayers)
        Swal.fire({
          title: 'Kudos into Karma',
          html:
            'Mayhem Digs Kindness <br />' +
            '<p style="color:black; font-weight:600">' +
            "If someone helped you get into the game, select their PlayerName below and we'll send them a <b>bonus Pick</b> to say thanks! <br /><br />" +
            "And, since saying thanks is kind, we'll send you a Pick as well! ",
          input: 'select',
          inputOptions: gamePlayers,
          inputAttributes: {
            autocapitalize: 'off',
          },
          showCancelButton: true,
          cancelButtonText: 'Skip',
          confirmButtonText: 'Find Player',
          showLoaderOnConfirm: true,
          preConfirm: playerName => {
            this.props.dispatch(checkPlayerName({ player: { name: gamePlayers[playerName] } })).then(res => {
              if (res && res.playerFound && gamePlayers[playerName] !== '') {
                this.props.dispatch(
                  postRequest('player/update_players_picks', {
                    type: UPDATE_PLAYERS_PICKS,
                    values: {
                      game: { code: this.props.match.params.game_code },
                      players: { friend_name: gamePlayers[playerName] },
                    },
                  })
                )
                this.ticketAlert(
                  '💖 You earned a bonus Pick for good Karma! Earn even more Picks by helping others get into the game!'
                )
                this.setState({ introRedeemed: true })
              }
            })
          },
          allowOutsideClick: () => !Swal.isLoading(),
        })
      }
    })
  }


  getSongPlayCount() {
    this.props.dispatch(makeRequest('player/songs_played', { type: PLAYER_SONGS_PLAYED }))
  }

  selectGamePlaylists() {
    this.props.dispatch(
      postRequest('player/host_playlists', {
        type: GET_HOST_PLAYLIST,
        values: { game: { code: this.props.match.params.game_code } },
      })
    )
  }

  noticeAlert(text) {
    toast.success(text, {
      position: 'bottom-right',
      autoClose: 60000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      draggablePercent: 40,
      className: 'toaster-css-2',
    })
  }

  ticketAlert(text) {
    toast.success(text, {
      position: 'top-right',
      autoClose: 30000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      draggablePercent: 40,
      className: 'toaster-css-1',
    })
  }

  notifyClient(data) {
    if (
      data.reward &&
      data.account_id &&
      (data.account_id == 'all' ||
        (this.props.player &&
          this.props.player.player &&
          (this.props.player.player.account_id == data.account_id ||
            (Array.isArray(data.account_id) && data.account_id.includes(this.props.player.player.account_id)))))
    ) {
      this.animateReward(data)
      if (data.auto_ticket && !['score11', 'score111'].includes(data.auto_ticket.status)) {
        setTimeout(() => {
          this.ticketAlert(
            '🏆 +' +
              data.auto_ticket.ticket_count +
              ' ticket for earning ' +
              data.auto_ticket.status +
              ' rank ' +
              data.auto_ticket.position +
              '!'
          )
        }, this.state.leaderboardTime * 1000)
      } else if (data.auto_ticket && data.auto_ticket.status == 'score11') {
        this.ticketAlert(
          '⭐️ +' +
            data.auto_ticket.ticket_count +
            ' ticket for 11 in your score'
        )
      } else if (data.auto_ticket && data.auto_ticket.status == 'score111') {
        this.ticketAlert(
          '⭐️ +' +
            data.auto_ticket.ticket_count +
            ' tickets for score 111'
        )
      }
    }

    if (
      data.gifted_to &&
      data.gifted_by &&
      this.props.player &&
      this.props.player.player &&
      this.props.player.player.name == data.gifted_to
    ) {
      this.ticketAlert(
        '💖 Hey, ' +
          data.gifted_to +
          ', you must be pretty awesome, because ' +
          data.gifted_by +
          ' sent you a Karma Pick to say Thanks for helping them!'
      )
      this.animateReward(data)
    }
  }

  animateReward(data) {
    if (document.getElementById(data.reward)) {
      document.getElementById(data.reward).style.animation = 'shake-lr 2s'
      if (data.account_id == 'all' || Array.isArray(data.account_id))
        this.ticketAlert('🏆 + Hey! You just got ' + data.count + ' ' + data.reward + '!')
      setTimeout(() => {
        document.getElementById(data.reward).style.animation = ''
      }, 1000)
    } else if ( data.reward == 'points'){
      if (data.account_id == 'all' || Array.isArray(data.account_id))
        this.ticketAlert('🏆 + Hey! You just got ' + data.count + ' ' + data.reward + '!')
    }
  }

  loadGameData(gameData) {
    if (gameData.game) {
      this.setState({ showBoomScreen: true })
      let channel_name = 'games_' + gameData.game.id
      pusher.unsubscribe(channel_name)
      const channel = pusher.subscribe(channel_name)
      channel.bind('game_event', data => {
        console.log(data.type)
        this.setState({ beginGame: true })
        switch (data.type) {
          case 'set_current_round':
            this.props.dispatch(updatePlayerPusherRequest({ rounds: data.data, state: data.type }))
            break
          case 'song_loaded':
            this.setState({ pusherCurrentSongCount: data.data.song_of_songs_count })
            this.getCurrentPoint()
            this.props.dispatch(
              updatePlayerPusherRequest({
                currentSong: data.data.loaded_song,
                loadedSong: data.data.loaded_song,
                reveal_seq_array: data.data.reveal_seq_array,
                state: data.type,
              })
            )
            this.setState({ currentSong: data.data.loaded_song, showBoomScreen: false })
            this.inputFieldAnimation()
            break
          case 'active_song':
            this.setState({
              songState: true,
              openSession: this.props.game && this.props.game.game && this.props.game.game.open_session,
              pusherCurrentSongCount: data.song_count,
            })
            break
          case 'showing_leaderboard':
            this.getSongPlayCount()
            this.setState({ pusherCurrentSongCount: data.data.song_of_songs_count, songState: false })
            this.getCurrentPoint()
            if (this.props.game && this.props.game.game && this.props.game.game.reset_round) {
              this.props.dispatch(
                updatePlayerPusherRequest({
                  currentSongScores: data.data.currentSongScores,
                  leaderboard: data.data.roundScores,
                  state: data.type,
                })
              )
            } else {
              this.props.dispatch(
                updatePlayerPusherRequest({
                  currentSongScores: data.data.currentSongScores,
                  leaderboard: data.data.leaderboard,
                  state: data.type,
                })
              )
            }
            break
          case 'show_ad_camp':
            this.props.dispatch(
              updatePlayerPusherRequest({
                assetsUrl: data.data.assets_url,
                leaderboard: data.data.leaderboard,
                state: data.type,
                advDuration: data.data.adv_duration * 1000,
              })
            )
            break
          case 'song_ended':
            this.props.dispatch(updatePlayerPusherRequest({ currentSong: '', state: data.type }))
            break
          case 'game_ended':
            this.setState({ showBoomScreen: false })
            this.props.dispatch(updatePlayerPusherRequest({ leaderboard: data.data.leaderboard, state: data.type }))
            break
          case 'start_new_game':
            localStorage['new_game_reset'] = true
            var new_url = data.data.replace('/games/', '/player/')
            window.location = new_url
            break
          case 'new_round_added':
            setTimeout(() => {
              window.location = data.data
            }, 10000)
            break
          case 'game_updated':
            location.reload()
            break
          case 'first_player_added':
            if (
              data.account &&
              this.props.auth.currentAccount &&
              this.props.auth.currentAccount.id &&
              this.props.auth.currentAccount.id == data.account
            )
              this.selectGamePlaylists()

            break
          case 'set_playlist_by_player':
            if (this.props.player.player && this.props.player.player.id && this.props.player.player.id == data.player)
              this.selectGamePlaylists()
            else if (
              this.props.player.player &&
              this.props.player.player.account_id &&
              this.props.player.player.account_id == data.player
            )
              this.selectGamePlaylists()

            break
          case 'rewards_updated':
            if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
              this.props.dispatch(
                postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
              )
            }
            this.notifyClient(data)
            break
          case 'slot_machine':
          case 'respin_slot_machine':
            if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
              this.props.dispatch(
                postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
              )
            }
            this._spiffValue = data.spiff_value
            break
          case 'guess_end':
            this.setState({ playerGuessTimerEnd: true })
            if(this.props.account && this.props.account.status === 'muted'){
              this.props.dispatch(
                postRequest('player/unmute_player', {
                  type: UNMUTE,
                  values: {
                    game: this.props.match.params.game_code,
                    status: this.props.account.status,
                  },
                })
              )
            }
            break
          case 'standard_trivia_started':
            if (this.props.auth.currentAccount && this.props.player && this.props.player.player){
              localStorage.removeItem('answer_updated')
              this.setState({ triviaMode: true })
            }
            break
          case 'standard_trivia_ended':
            if (this.props.auth.currentAccount){
              localStorage.removeItem('answer_updated')
              this.setState({ triviaMode: false })
            }
            break
          case 'mayhem_mates_started':
            if (this.props.auth.currentAccount){
              localStorage.removeItem('answer_updated')
              this.setState({ mayhemMatesMode: true })
            }
            break
          case 'mayhem_mates_ended':
            if (this.props.auth.currentAccount){
              localStorage.removeItem('answer_updated')
              this.setState({ mayhemMatesMode: false })
            }
            break
          case 'drawing_winner':
            if (
              this.props.player &&
              this.props.player.player &&
              data.data &&
              this.props.player.player.account_id == data.data.account_id
            )
              this.ticketAlert('🏆 +1 Prize! YOU WON THE RAFFLE!')
            break
          case 'answers_updated':
            if (
              this.props.player &&
              this.props.player.player &&
              this.props.player.player.account_id &&
              this.props.player.player.account_id == data.player_id
            )
              this.setState({ answerUpdated: true })

            break
          case 'allowNextGuess':
            this.setState({ answerUpdated: false })
            break
          case 'reload_game':
            this.props.dispatch(resetState())
            break
          case 'ask_player_continue':
            this.timer = 21
            Swal.fire({
              title: '<strong>Want to play More?</strong>',
              type: 'question',
              html: 'this window will close in <strong></strong> seconds',
              showCloseButton: true,
              showCancelButton: true,
              focusConfirm: false,
              timer: 20000,
              onOpen: () => {
                this.getTimer()
              },
              confirmButtonText: 'Yes!',
              cancelButtonText: 'No',
            }).then(result => {
              if (result.value) {
                this.props.dispatch(
                  postRequest('games/pusher_update', {
                    values: { game: { code: this.props.game.game.code, status: 'startNextRound' } },
                  })
                )
              }
            })
            break
          case 'start_next_round':
            Swal.close()
            break
          case 'player_limit_exceeded':
            if (
              this.props.auth &&
              this.props.auth.currentAccount &&
              this.props.auth.currentAccount.id &&
              this.props.auth.currentAccount.id == data.player_id
            ) {
              this.ticketAlert('🏆 sorry, game is full, try again later')
              if (document.getElementById('join-button')) document.getElementById('join-button').innerText = 'JOIN'
              setTimeout(() => {
                location.reload()
              }, 3000)
            }
            break
          case 'game_winner':
            if (
              this.props.player &&
              this.props.player.player &&
              data.data &&
              this.props.player.player.account_id == data.data.account_id
            ) {
              setTimeout(() => {
                this.ticketAlert('🏆 +1 Prize! YOU WON THE GAME! Redeem from your Home screen!')
              }, 18000)
            }
            break
          case 'new_message':
            if (
              this.props.player &&
              this.props.player.player &&
              data.data &&
              this.props.player.player.account_id == parseInt(data.data.message_to)
            ){
              this.ticketAlert(' 💬 '+data.data.message_from+' : '+data.data.message+' ')
              let element = document.getElementById('chat')
              if(element) element.style.animation = 'shake-lr 2s'
              setTimeout(() => {
                if(element) element.style.animation = ''
              }, 1000)
            }
            break
        }
      })
    }
  }

  loadPlayerGuessData(gameData) {
    if (gameData.game) {
      let channel_name = 'players_guess_data_' + gameData.game.id
      const channel = pusher.subscribe(channel_name)
      channel.bind('player_guess_event', data => {
        switch (data.type) {
          case 'player_muted':
            if (
              this.props.player &&
              this.props.player.player &&
              this.props.player.player.account_id == data.muted_player_account_id
            )
            this.props.dispatch(
              postRequest('player/rewards', { type: REWARDS, values: { session_id: this.props.game.game.session_id } })
            )
            break
        }
      })
    }
  }

  inputFieldAnimation() {
    if (document.getElementById('guessInput')) {
      document
        .getElementById('guessInput')
        .setAttribute(
          'style',
          'animation: beat 0.5s; border: 2px solid #ffca27; box-shadow: 2px 5px 9px #ffca27; border-radius : 10px;'
        )
      setTimeout(() => {
        if (document.getElementById('guessInput')) document.getElementById('guessInput').removeAttribute('style')
      }, 3000)
    }
  }

  render() {
    const { status } = this.props.account
    const session = this.props.game && this.props.game.game && this.props.game.game.open_session
    const { state } = this.props.game
    const { player } = this.props
    const {
      reward,
      songState,
      openSession,
      playerGuessTimerEnd,
      gameOver,
      beginGame,
      showBoomScreen,
      currentSong,
      pusherCurrentSongCount,
      triviaMode,
      mayhemMatesMode,
      roundTotalScore,
      showChatModal,
      gamePlayers
    } = this.state
    const points = roundTotalScore || this.props.game && this.props.game.points
    const pusherDataCondition = beginGame && player && player.player && player.playerPusherData
    const checkGameState = state == 'Active Song' || state == 'Song Loaded'
    const guessScreenConditions = pusherDataCondition && player.playerPusherData.state == 'song_loaded'
    const reloadedGuessScreenConditions = !beginGame && player && player.player && this.props.game && checkGameState
    return (
      <div>
        {!triviaMode && !mayhemMatesMode &&(
          <div>
            {reward == 'ticket' && (
              <Tickets
                model
                {...this.props}
                pageState={p => this.setState({ reward: p })}
                spiffValue={this._spiffValue}
              />
            )}
            {reward == 'pick' && (
              <Picks
                showBoomScreen={showBoomScreen}
                model
                {...this.props}
                pageState={p => this.setState({ reward: p })}
              />
            )}
            {reward == 'spiff' && <Spiffs model {...this.props} pageState={p => this.setState({ reward: p })} />}
            {(reloadedGuessScreenConditions || guessScreenConditions) && (
              <div>
                <PlayerGuessScreen
                  guessTimerEnd={playerGuessTimerEnd}
                  session={openSession}
                  player_status={status || 'unmute'}
                  song_status={songState}
                  current_session={session}
                  status={songState}
                  {...this.props.account}
                  pusherCurrentSongCount={
                    pusherCurrentSongCount ? pusherCurrentSongCount : this.props.game.game.song_of_songs_count
                  }
                  song={currentSong}
                  player={player.player.id}
                  player_name={player.player.name}
                  game={this.props.game.game}
                  round={this.props.game.rounds}
                  setRoundTotalScore={ x => this.setState({ roundTotalScore: x})}
                  playerGuessing={player.playerGuessing}
                  spiffValue={this._spiffValue}
                  getChatModal={() => this.setState({ showChatModal: true })}
                />
              </div>
            )}
            {showChatModal && <ChatModal code={this.props.game.game.code} closeModal={() => this.setState({ showChatModal: false })}/>}
            {this.props.auth && player && !player.player && this.props.auth.currentAccount && (
              <RegistrationWelcome
                gameCode={this.props.match.params.game_code}
                username={this.props.auth.currentAccount.username}
                allowJoin={() => this.setState({ allowJoin: true })}
              />
            )}
            {!gameOver && player && player.player && showBoomScreen && !checkGameState && (
              <div>
                <PlayerWelcomeScreen session={session} />
                {this.PlayerProfile(player.player.name, points)}
              </div>
            )}
            {pusherDataCondition && player.playerPusherData.state == 'showing_leaderboard' && (
              <div>
                <PlayerSongEnd
                  session={session}
                  gameCode={this.props.match.params.game_code}
                  songDetails={currentSong}
                  player={player.player}
                  leaderboard={player.playerPusherData.leaderboard}
                />
                {this.PlayerProfile(
                  player.player.name,
                  points,
                  pusherCurrentSongCount ? pusherCurrentSongCount : this.props.game.game.song_of_songs_count
                )}
              </div>
            )}
            {reward == 'pick' && (
              <Picks
                songStatus={songState}
                showBoomScreen={showBoomScreen}
                model
                {...this.props}
                pageState={p => this.setState({ reward: p })}
              />
            )}
            {pusherDataCondition && player.playerPusherData.state == 'show_ad_camp' && (
              <div>
                <ClientAdvScreen session={session} />
                {this.PlayerProfile(player.player.name, points)}
              </div>
            )}
            {pusherDataCondition && player.playerPusherData.state == 'game_ended' && (
              <PlayerGameEnd
                guest={this.props.auth.currentAccount.confirmed_at}
                game={this.props.game.game}
                gameCode={this.props.game.game.code}
                songDetails={currentSong}
                player={player.player}
                leaderboard={player.playerPusherData.leaderboard}
                gameOverTime={this.props.game.rounds.settings.game_over_display_time}
              />
            )}
            {gameOver && <GameOverScreen />}
          </div>
        )}
        {triviaMode && <StandardTriviaClient {...this.props} answerState={this.state.answerUpdated} />}
        {mayhemMatesMode && <MayhemMatesClient {...this.props} answerState={this.state.answerUpdated} />}
      </div>
    )
  }
}

function mapStateToProps(store) {
  return {
    auth: store.auth,
    account: store.account,
    game: store.game,
    player: store.player,
  }
}

export default connect(mapStateToProps)(MusicMayhemClient)
