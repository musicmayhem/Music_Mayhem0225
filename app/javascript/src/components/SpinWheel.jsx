import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap'

class SpinWheel extends Component {
  state = {
    list: [
        "SOLO",
        "+5 TICKETS",
        "MAYHEM",
        "MUTE",
        "EQUALIZER",
        "+100 POINTS",
        "BONUS PICK",
        "MAYHEM",
        "NO TITLE HINTS",
        "+1 TICKET",
        "NO ARTIST HINTS",
        "SELECT PLAYLIST",
        "BONUS ROUND",
        "NO CHANGE",
        "+50 POINTS",
        "+250 POINTS"
      ],
    radius: 105, // PIXELS
    rotate: 0, // DEGREES
    easeOut: 0, // SECONDS
    angle: 0, // RADIANS
    top: null, // INDEX
    offset: 0, // RADIANS
    net: null, // RADIANS
    result: null, // INDEX
    spinning: false,
    windowSize: window.innerWidth,
    thumbWidth: 75,
    wheelType: 'Default',
  };

  UNSAFE_componentWillMount(){
    if(this.props.wheelType == 'Bonus Wheel'){
      this.setState({ list: ["Jack","Jack","Jack","Jack","Jack","Jackpot","Jack","Jack","Jack","Jack","Jack"], wheelType: this.props.wheelType })
    } else if(this.props.wheelType == 'Player Names' && this.props.playerNames ){
      this.setState({ list: this.props.playerNames, wheelType: this.props.wheelType })
    }
  }

  componentDidMount() {
    // generate canvas wheel on load
    this.renderWheel();
  }

  renderWheel() {
    // determine number/size of sectors that need to created
    let numOptions = this.state.list.length;
    let arcSize = (2 * Math.PI) / numOptions;
    this.setState({
      angle: arcSize
    });

    // get index of starting position of selector
    this.topPosition(numOptions, arcSize);

    // dynamically generate sectors from state list
    let angle = 0;
    for (let i = 0; i < numOptions; i++) {
      let text = this.state.list[i];
      // this.renderSector(i + 1, text, angle, arcSize, this.getColor());
      if(this.props.wheelType == 'Bonus Wheel'){
        this.renderSector(i + 1, text, angle, arcSize, this.getColor());
      } else {
        if(i%2==0){
          this.renderSector(i + 1, text, angle, arcSize, `#ffca27`);
        }else{
          this.renderSector(i + 1, text, angle, arcSize, `#ffffff`);
        }
      }
      angle += arcSize;
    }
  }

  topPosition = (num, angle) => {
    // set starting index and angle offset based on list lengths

    let topSpot = null;
    let degreesOff = null;

    if ((num%4) === 0) {
      topSpot = num - num/4;
      degreesOff = 0;
    } else if ((num%4) <= 3) {
      topSpot = num - parseInt(num/4);
      degreesOff = Math.PI / 2 - angle * parseInt(num/4);
    }

    this.setState({
      top: topSpot - 1,
      offset: degreesOff
    });
  };

  renderSector(index, text, start, arc, color) {
    // create canvas arc for each list element
    let canvas = document.getElementsByClassName("wheel")[0];
    let ctx = canvas.getContext("2d");
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let resizer = this.state.windowSize < 768 ? 1 - (768 - this.state.windowSize)/1500 : 1
    let radius = this.state.radius * resizer;
    let startAngle = start;
    let endAngle = start + arc;
    let angle = index * arc;
    // let baseSize = radius * 3.33;
    let baseSize = 75 * 3.33;
    let textRadius = baseSize - 120 / resizer
    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle, false);
    ctx.lineWidth = radius * 2;
    ctx.strokeStyle = color;
    if(this.state.list.length > 20)
      ctx.font = this.state.windowSize < 700 ? "1vmax Arial" : "10px Arial";
    else
      ctx.font = this.state.windowSize < 700 ? "1.6vmax Arial" : "16px Arial";
    ctx.fillStyle = "black";
    ctx.stroke();

    ctx.save();
    ctx.translate(
      baseSize + Math.cos(angle - arc / 2) * textRadius,
      baseSize + Math.sin(angle - arc / 2) * textRadius
    );
    ctx.rotate(angle - arc / 2 + 2 * Math.PI );
    ctx.fillText(text, -ctx.measureText(text).width / 2, 4);
    ctx.restore();
  }

  getColor() {
    // randomly generate rbg values for wheel sectors
    let r = Math.floor(Math.random() * 400);
    let g = Math.floor(Math.random() * 400);
    let b = Math.floor(Math.random() * 400);
    return `rgba(${r},${g},${b})`;
  }

  spin = randomSpin => {
    // set random spin degree and ease out time
    // set state variables to initiate animation
    this.setState({
      rotate: randomSpin,
      easeOut: 5,
      spinning: true
    });

    // calcalute result after wheel stops spinning
    setTimeout(() => {
      this.getResult(randomSpin);
    }, 6000);
  };

  getResult = spin => {
    // find net rotation and add to offset angle
    // repeat substraction of inner angle amount from total distance traversed
    // use count as an index to find value of result from state list
    const { angle, top, offset, list } = this.state;
    let netRotation = ((spin % 360) * Math.PI) / 180 + 3*Math.PI / 2; // RADIANS
    let travel = netRotation + offset;
    let count = top + 1;
    while (travel > 0) {
      travel = travel - angle;
      count--;
    }
    let result;
    if (count >= 0) {
      result = count;
    } else {
      result = list.length + count;
    }

    if(!this.props.mirror && this.state.wheelType == 'Default') {
      this.props.mayhemSpinnerUpdate(this.state.list[result])
    }
    // set state variable to display result
    this.setState({
      net: netRotation,
      result: result
    });
  };

  reset = () => {
    // reset wheel and result
    this.setState({
      rotate: 0,
      easeOut: 0,
      result: null,
      spinning: false
    });
  };

  render() {
    return (
      <Container
        style={{
          height: '60vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Row>
          <Col>
            <Row xs={12} xm={12} >
              <Col xs={9} xm={9}>
                <canvas
                  className="wheel"
                  width="500"
                  height="500"
                  style={{
                    WebkitTransform: `rotate(${this.state.rotate}deg)`,
                    WebkitTransition: `-webkit-transform ${
                      this.state.easeOut
                    }s ease-out`
                  }}
                />
              </Col>
              <Col xs={3} xm={3}>
                <div className="wheel-selector" >
                  <span>&#9664;</span>
                </div>
              </Col>
              <button  id="wheel-button" onClick={() => this.spin(Math.floor(Math.random() * 900) + 3000)} style={{ display: 'none'}} />
            </Row>
            <Row xs={12} xm={12} >
              <Col xs={12} xm={12}>
                {this.state.list[this.state.result] == 'SOLO' && (
                  <div>
                    <h1 className="wheel-result">SOLO</h1>
                    <h4 className="wheel-result-text" >Players below 5th place get 20 points</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'MUTE' && (
                  <div>
                    <h1 className="wheel-result">MUTE</h1>
                    <h4 className="wheel-result-text" >First place round leader loses 20 points</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'EQUALIZER' && (
                  <div>
                    <h1 className="wheel-result">EQUALIZER</h1>
                    <h4 className="wheel-result-text" >Top 5 round leaders lose 20 points</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'MAYHEM' && (
                  <div>
                    <h1 className="wheel-result">MAYHEM</h1>
                    <h4 className="wheel-result-text" >Spin for a winner</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == '+5 TICKETS' && (
                  <div>
                    <h1 className="wheel-result">+5 TICKETS</h1>
                    <h4 className="wheel-result-text" >Spin for a winner!</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == '+100 POINTS' && (
                  <div>
                    <h1 className="wheel-result">+100 POINTS</h1>
                    <h4 className="wheel-result-text" >Spin for a winner!</h4>
                  </div>
                )}
                  {this.state.list[this.state.result] == '+250 POINTS' && (
                  <div>
                    <h1 className="wheel-result">+250 POINTS</h1>
                    <h4 className="wheel-result-text" >Spin for a winner!</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'BONUS PICK' && (
                  <div>
                    <h1 className="wheel-result">BONUS PICK</h1>
                    <h4 className="wheel-result-text" >Spin for a winner!</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'NO TITLE HINTS' && (
                  <div>
                    <h1 className="wheel-result">NO TITLE HINTS</h1>
                    <h4 className="wheel-result-text" >Next round will only show Arist hint tiles</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == '+1 TICKET' && (
                  <div>
                    <h1 className="wheel-result">+1 TICKET</h1>
                    <h4 className="wheel-result-text" >Spin for a winner</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'NO ARTIST HINTS' && (
                  <div>
                    <h1 className="wheel-result">NO ARTIST HINTS</h1>
                    <h4 className="wheel-result-text" >Next Round will only show Song Title Tiles</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'SELECT PLAYLIST' && (
                  <div>
                    <h1 className="wheel-result">SELECT PLAYLIST</h1>
                    <h4 className="wheel-result-text" >Spin for a winner</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == 'BONUS ROUND' && (
                  <div>
                    <h1 className="wheel-result">BONUS ROUND</h1>
                    <h4 className="wheel-result-text" >Good for one dealers-choice bonus round</h4>
                  </div>
                )}                {this.state.list[this.state.result] == 'NO CHANGE' && (
                  <div>
                    <h1 className="wheel-result">NO CHANGE</h1>
                    <h4 className="wheel-result-text" >Nothing changes</h4>
                  </div>
                )}
                {this.state.list[this.state.result] == '+50 POINTS' && (
                  <div>
                    <h1 className="wheel-result">+50 POINTS</h1>
                    <h4 className="wheel-result-text" >Spin for a winner</h4>
                  </div>
                )}
                {(this.state.wheelType !== 'Default') && (
                  <div>
                    <h1 className="wheel-result">{this.state.list[this.state.result]}</h1>
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    )
  }
}

export default SpinWheel
