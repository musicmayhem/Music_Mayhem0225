import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import { connect } from 'react-redux'
import PickIcon from '../../images/picks.svg'
import Modal from 'react-responsive-modal'
import { REWARDS, REDEEM_PICK } from '../../constants/accountConstants'
import { postRequest } from '../../actions/gameAction'
import { GAME_PLAYERS } from '../../constants/gameConstants'
import Swal from 'sweetalert2'
import CollapsiblePick from './CollapsiblePick'

class Picks extends React.Component {

  _runOnce=true

  UNSAFE_componentWillMount() {
    this.rewardRequest()
    if (this.props.match && this.props.match.params && this.props.match.params.game_code) {
      this.props.dispatch(
        postRequest('games/game_players', {
          type: GAME_PLAYERS,
          values: { game: { code: this.props.match.params.game_code } },
        })
      )
    } else {
      this.props.dispatch(
        postRequest('games/game_players', {
          type: GAME_PLAYERS,
          values: { game: { code: this.props.game && this.props.game.game && this.props.game.game.code } },
        })
      )
    }
  }

  warningSwal(){
    Swal({
      position: 'center',
      type: 'warning',
      title: 'Cannot be used here!',
      text: 'Only Availble While Guessing',
      showConfirmButton: false,
      timer: 1500,
    })
  }

  pickRedeemResponse(np){
    this._runOnce = false
    if (np.account.pickRedeemed == 1) {
      Swal({
        position: 'center',
        type: 'success',
        title: 'Picks Redeemed',
        showConfirmButton: false,
        timer: 1500,
      })
      this.props.pageState('')
      this.rewardRequest()
    } else if (np.account.pickRedeemed == 2){
        if (np.account.lastPickRedeemed === 'Pick Playlist' || np.account.lastPickRedeemed === 'Mute Player') {
          Swal({
            position: 'center',
            type: 'warning',
            title: 'Dang, someone beat you to it!  Try again later!',
            showConfirmButton: false,
            timer: 1500,
          })
        } else if (np.account.lastPickRedeemed === 'Free Ride') {
            if( np.account.pickRedeemedPreviously){
              Swal({
                position: 'center',
                type: 'warning',
                title: 'Already redeemed!',
                text: 'Try it in upcoming songs!',
                showConfirmButton: false,
                timer: 1500,
              })
            } else {
              this.warningSwal()
            }
        } else if (np.account.lastPickRedeemed === 'Sneak Peek'){
            this.warningSwal()
        } else {
          Swal({
            position: 'center',
            type: 'warning',
            title: 'Sorry!',
            text: 'Pick cannot be redeemed',
            showConfirmButton: false,
            timer: 1500,
          })
        }
      }
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (np.account && np.account.pickRedeemed && np.account.lastPickRedeemed && this._runOnce) {
      this.pickRedeemResponse(np)
    }
  }

  objectify(array) {
    return array.reduce(function(result, currentArray) {
      result[currentArray[0]] = currentArray[1]
      return result
    }, {})
  }

  rewardRequest = () => {
    if (this.props.game && this.props.game.game && this.props.game.game.session_id) {
      this.props.dispatch(
        postRequest('player/rewards', { type: REWARDS, values: { session_id:  this.props.game.game.session_id } })
      )
    }
  }

  redeemReward2 = pick => {
    this._runOnce = true
    let gamePlayers = this.objectify(this.props && this.props.game && this.props.game.allPlayers)
    if (pick == 'Mute Player' && this.props.songStatus == false) {
      Swal({
        title: 'Mute Player',
        input: 'select',
        inputOptions: gamePlayers,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Mute!',
      }).then(result => {
        if(result.value){
          this.props.dispatch(
            postRequest('player/redeem_pick', {
              type: REDEEM_PICK,
              values: {
                game: { code: this.props.game && this.props.game.game && this.props.game.game.code },
                pick: pick,
                muted_player: result.value,
              },
            })
          )
        }
      })
    } else {
      Swal({
        position: 'center',
        type: 'warning',
        title: 'Whoa There, Horsey!',
        text: 'Mutes can only be used between songs. Try again then!',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }
  redeemReward = pick => {
    this._runOnce = true
    if(this.props.sneakPeekRedeemed && pick == 'Sneak Peek'){
      Swal({
        position: 'center',
        type: 'warning',
        title: 'Already redeemed!',
        text: 'Try it in upcoming songs!',
        showConfirmButton: false,
        timer: 1500,
      })
    } else {
      if (
        (this.props.showBoomScreen ||
          (this.props.account && this.props.account.status && this.props.account.status == 'muted')) &&
          (pick == 'Free Ride' || pick == 'Sneak Peek')
        ) {
          this.warningSwal()
        } else if (this.props.match && this.props.match.params && this.props.match.params.game_code) {
          this.props.dispatch(
            postRequest('player/redeem_pick', {
              type: REDEEM_PICK,
              values: { game: { code: this.props.match.params.game_code }, pick: pick },
            })
          )
        } else {
          this.props.dispatch(
            postRequest('player/redeem_pick', {
              type: REDEEM_PICK,
              values: { game: { code: this.props.game && this.props.game.game && this.props.game.game.code }, pick: pick },
            })
          )
        }
    }
  }

  render() {
    const picks = [
      [
        'Sneak Peek',
        "Don't wait! Get the answer to the current song now!  ▶️ Use only when a song is playing.",
        1,
      ],
      ['Buy Tix', 'Improve your odds of winning a prize with 3 additional raffle tickets. ', 1],
      [
        'Free Ride',
        'Torch the competition! Get full points for one song.  ▶️ Use only when a song is playing',
        2,
      ],
      ['Pick Playlist', 'Take control! Select the playlist for next round and crush your opponents.', 3],
      [
        'Mute Player',
        'Silence is golden! Quiet another player by cutting their song score in half.  ▶️ Use only between songs.',
        4,
      ],
    ]
    const { picksCount } = this.props.account
    let str = 'MY \n' + 'MAYHEM \n' + 'Picks \n'
    return (
      <Container>
        <Row center="xs" style={{ padding: '0px' }}>
          <Col xs={12} style={{ padding: 0, background: 'none', width: '335px' }}>
            <Modal open={true} onClose={() => this.props.pageState('')} center>
              <pre
                style={{
                  color: '#ffca27',
                  fontWeight: 'bold',
                  fontSize: '30px',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'left',
                  marginBottom: '-2rem',
                  background: '#231844',
                }}
              >
                <div>
                  <span id="notice-badge-model" className="fa-stack fa-5x has-badge" data-count={picksCount}>
                    <img src={PickIcon} width="40px" style={{ height: '80px', width: '80px', margin: '24% 8%' }} />
                  </span>
                </div>
                <div style={{ textAlign: 'left', lineHeight: '1', marginLeft: '-12px', marginTop: '31px' }}>{str}</div>
              </pre>
              <div
                style={{
                  marginTop: '1rem',
                  background: '#231844',
                  paddingTop: '1rem',
                  paddingLeft: '18px',
                  paddingRight: '18px',
                  paddingBottom: '25px',
                }}
              >
                <Container style={{ textAlign: 'left' }}>
                  <div style={{ color: 'lightblue', margin: '10px 0' }}>
                    Picks give you power! Earn one for each game you join. <br />
                    Ask your host how you can earn more!
                  </div>
                  {picks.map((p, i) => (
                    <CollapsiblePick
                      data={p[1]}
                      p={p}
                      key={i}
                      picksCount={picksCount}
                      redeemR={p => this.redeemReward(p)}
                      redeemR2={p => this.redeemReward2(p)}
                    />
                  ))}
                </Container>
              </div>
            </Modal>
          </Col>
        </Row>
      </Container>
    )
  }
}

function mapStateToProps(store) {
  return {
    account: store.account,
    game: store.game,
  }
}
export default connect(mapStateToProps)(Picks)
