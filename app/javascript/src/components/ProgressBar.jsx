import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid'
import CountUp from 'react-countup';

class ProgressBar extends Component {

  addTimer(){
    if(document.getElementsByClassName("progress-value") && document.getElementsByClassName("progress-value").length > 0 ){
      document.getElementsByClassName("progress-value")[0].style.animation = 'load '+this.props.timer+'s linear forwards'
    }
  }

  render(){
    return(
      <Row style={{ marginTop: '20px', marginLeft: '5px', marginRight: '5px'}}>
          <Col xs={12} ><div className="progress-value"></div></Col>
           { this.props.timer && this.addTimer() }
      </Row>
    )
  }
}


export default ProgressBar
