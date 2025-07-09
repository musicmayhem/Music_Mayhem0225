import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, Row, Col, Button } from 'reactstrap'
import { instantRequest } from '../actions/gameAction'
import { checkUserIsLogin } from '../actions/loginActions'
import Trophy from '../images/Trophy.svg'

class SeriesSummary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data_recieved: false,
      data_not_recieved: false,
      animate: false,
    }
  }

  _seriesData = null

  UNSAFE_componentWillMount() {
    // this.props.checkUserIsLogin().then(res => {
    //   if (res){
    //     let series_name = window.location.href.split('/').pop().replace(/%20/g,' ')
    //     this.props.instantRequest('games/get_series_summary', { values: { series_name: series_name }, } ).then(res => {
    //       if (res && res.series.length > 0) {
    //         this._seriesData = res
    //         this.setState({ data_recieved: true })
    //       }else{
    //         this.setState({ data_not_recieved: true })
    //       }
    //     })
    //   }
    //   else
    //    this.props.history.push('/login')
    //   })
    let series_name = window.location.href.split('/').pop().replace(/%20/g,' ')
    this.props.instantRequest('games/get_series_summary', { values: { series_name: series_name }, } ).then(res => {
      if (res && res.series.length > 0) {
        this._seriesData = res
        this.setState({ data_recieved: true })
      }else{
        this.setState({ data_not_recieved: true })
      }
    })
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ animate: true })
    }, 1200)
  }

  render() {
    const { handleSubmit } = this.props
    const { data_recieved, data_not_recieved } = this.state
    return (
      <Container>
        {data_recieved && (
          <div>
            <Row center="xs" style={{top: '20%'}}>
              <Row style={{ backgroundColor: 'rgba(0, 0, 0, 0)', height: '6vmax', margin: '10px'}} className='series-summary-div'>
                <Col xs={12} sm={12} >
                <b  style={{ color: 'white', fontSize: '3.2vmax'}} className='series-summary-data'>{this._seriesData.series[0].name}</b>
                </Col>
              </Row>
              <Container>
                <Row>
                <Col xs={12} sm={6} start="xs">
                <Row style={{ backgroundColor: 'rgba(0, 0, 0, .2)', height: '8vmax', margin: '10px'}} className='series-summary-div'>
                  <Col xs={9} sm={9} style={{ background: '#ffca27'}} >
                    <b style={{ color: '#000', fontSize: '1.6vmax'}} className='series-summary-table-font' >LAST WEEK'S WINNER:</b>
                    {this._seriesData.last_session_winner && this._seriesData.last_session_winner.length > 0 && (
                        <p style={{ color: '#000', fontSize: '1.6vmax'}} className='series-summary-table-font' >{this._seriesData.last_session_winner[1]}</p>
                    )}
                  </Col>
                  <Col xs={3} sm={3} className='winner-animation-div show-animation-winner summary-trophy' style={{ overflow: 'hidden'}} >
                    <img src={Trophy} style={{ width: '7.8vmax'}} className='series-summary-trophy' />
                  </Col>
                </Row>
                <Row style={{ backgroundColor: 'rgba(0, 0, 0, .2)', height: '8vmax', margin: '10px'}} className='series-summary-div' >
                  <Col xs={3} sm={3} style={{padding: '13px'}}>
                    <b  style={{ color: '#ffca27', fontSize: '3vmax'}} className='series-summary-data'>{this._seriesData.total_players}</b>
                  </Col>
                  <Col xs={9} sm={9} style={{padding: '15px'}}>
                    <b  style={{ color: 'white', fontSize: '1.8vmax'}} className='series-summary-div-font' >TOTAL PLAYERS THIS SEASON</b>
                  </Col>
                </Row>
                <Row style={{ backgroundColor: 'rgba(0, 0, 0, .2)', height: '8vmax', margin: '10px'}} className='series-summary-div'>
                  <Col xs={3} sm={3} style={{padding: '13px'}}>
                    <b  style={{ color: '#ffca27', fontSize: '3vmax'}} className='series-summary-data'>{this._seriesData.avg_score}</b>
                  </Col>
                  <Col xs={9} sm={9} style={{padding: '15px'}}>
                    <b  style={{ color: 'white', fontSize: '1.8vmax'}} className='series-summary-div-font'>AVERAGE PLAYER SCORE</b>
                  </Col>
                </Row>
                <Row style={{ backgroundColor: 'rgba(0, 0, 0, .2)', height: '8vmax', margin: '10px'}} className='series-summary-div'>
                  <Col xs={3} sm={3} style={{padding: '13px'}}>
                    <b  style={{ color: '#ffca27', fontSize: '3vmax'}} className='series-summary-data'>{this._seriesData.max_score}</b>
                  </Col>
                  <Col xs={9} sm={9} style={{padding: '15px'}}>
                    <b  style={{ color: 'white', fontSize: '1.8vmax'}} className='series-summary-div-font'>BEST GAME SCORE</b>
                  </Col>
                </Row>
              </Col>
              <Col xs={12} sm={6} >
                <Row style={{ backgroundColor: 'rgba(0, 0, 0, .2)', height: '4vmax', margin: '10px', display: 'flex', justifyContent: 'center'}} className='series-summary-div-small'>
                  <b style={{ color: '#ffca27', fontSize: '2.5vmax'}} className='series-summary-data' >LEAGUE LEADERS</b>
                </Row>
                <Row style={{ backgroundColor: 'rgba(0, 0, 0, .2)', margin: '10px', padding: '25px'}} >
                  <div className={!this.state.animate ? 'series-animated-list-colored' : 'series-animated-list-colored series-animate-list-colored'}>
                    <Row style={{ margin: '0rem 1rem' }}>
                      <Col xs={12}>
                      </Col>
                      <Col xs={12} className="series-leaderboard-list">
                        {this._seriesData && this._seriesData.top_11 && this._seriesData.top_11.map( (x,i) =>{
                        return (
                          <div xs={12} key={i} style={{ color: i > 2 ? 'white' : ''}} className='series-summary-table-font' >
                            <span>{i + 1}</span>
                            <span>{x[1]}</span>
                          </div>
                        )}
                       )}
                      </Col>
                  </Row>
                </div>
                </Row>
              </Col>
             </Row>
           </Container>
          </Row>
          </div>
        )}
        {data_not_recieved && (
          <Row center="xs">
            <Col xs={12}>
              <Row style={{justifyContent: 'center', marginTop: '10%'}}>
                <b style={{color: '#ffca27', fontSize: '4vmax'}} >SERIES NOT FOUND</b>
              </Row>
            </Col>
            <Col xs={12}>
              <Row style={{justifyContent: 'center', marginTop: '20%'}}>
              <div
                style={{ color: 'white', fontSize: '1.8vmax' , borderStyle: 'solid', padding: '1.5rem', borderRadius: '50px'}}
                onClick={()=> this.props.history.goBack()}
                >
                <i className="fa fa-arrow-left" aria-hidden="true" style={{ marginRight: '5px'}}></i>
                GO BACK
              </div>
            </Row>
            </Col>
          </Row>
        )}
     </Container>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    instantRequest: (path, params) => dispatch(instantRequest(path, params)),
    checkUserIsLogin: (path, params) => dispatch(checkUserIsLogin(path, params)),
  }
}

export default connect(
  state => {
    return {
      auth: state.auth,
    }
  },
  mapDispatchToProps
)(SeriesSummary)
