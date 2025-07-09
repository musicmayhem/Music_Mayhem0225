import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'

export default class ListColored extends Component {
  state = {
    animate: false,
    basicList: false,
    roundLeaders: null,
    base: 0,
  }


  componentDidMount() {
    if(this.props.gameLeaders) this.updateList(this.props.gameLeaders)
  }


  updateList(gameLeaders){
    var base
    if(gameLeaders.length%5==0){
      base = gameLeaders.length - 5
    }else{
      base = gameLeaders.length - gameLeaders.length%5
    }
    if(base > 0){
      this.setState({ roundLeaders: gameLeaders.splice(base,base+5), base: base, basicList: true })
      setTimeout(() => {
        this.updateList(gameLeaders)
      },5000)
    }else{
      this.setState({ roundLeaders: gameLeaders, basicList: false })
      setTimeout(() => {
       this.setState({ animate: true })
      }, 1200)
    }
  }

  render() {
    const { roundLeaders, basicList, base } = this.state
    return (
      <div className={!this.state.animate && !basicList ? 'animated-list-colored' : 'animated-list-colored animate-list-colored'}>
        <Row style={{ margin: '0rem 3rem' }}>
          <Col xs={12} style={{ borderBottom: '2px solid #fff' }}>
            <h1 className="font-light">
              {this.props.session ? 'Round Leaders' : 'Game Leaders'}
              <div style={{ display: 'inline-block', float: 'right' }}>
                <i className="fa fa-trophy" style={{ color: '#c2af8b', fontSize: '1.3rem', margin: '0 0.2rem' }} />
                <i className="fa fa-trophy" style={{ color: '#dcdcdc', fontSize: '1.7rem', margin: '0 0.2rem' }} />
                <i className="fa fa-trophy" style={{ color: '#ffca27' }} />
              </div>
            </h1>
          </Col>
          {!basicList && (
            <Col xs={12} className="leaderboard-list">
              {roundLeaders &&
                roundLeaders.sort(this.sortDesc).map((value, key) => {
                  return (
                    <div xs={12} key={key}>
                      <span>{ key + 1}</span>
                      <span>{value && value.name}</span>
                      <span>{value && value.total_score}</span>
                    </div>
                  )
                })}
            </Col>
          )}
          {basicList && (
            <Col xs={12} className="leaderboard-list-basic" >
              {roundLeaders &&
                roundLeaders.sort(this.sortDesc).map((value, key) => {
                  return (
                    <div xs={12} key={key}>
                      <span>{base + key + 1}</span>
                      <span>{value && value.name}</span>
                      <span>{value && value.total_score}</span>
                    </div>
                  )
                })}
            </Col>
          )}
        </Row>
      </div>
    )
  }
}
