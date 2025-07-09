import React, { Component } from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'

class LeaderBoardTable extends Component {
  sortDesc = (a, b) => {
    if (a.total_score > b.total_score) return -1
    if (a.total_score < b.total_score) return 1
    return 0
  }

  render() {
    let itemsArray = this.props.itemsArray
    return (
      <div style={{ background: '#fff', padding: '1rem 1rem', paddingBottom: 0 }}>
        <br />
        <h3 className="font-light">
          {this.props.final ? 'Final Standings' : this.props.songWinners ? 'Song Winner' : 'Leaderboard'}
        </h3>
        <Container style={{ marginTop: '1rem', borderTop: '1px solid #ddd', padding: '1rem 0' }}>
          {itemsArray &&
            itemsArray.length != 0 &&
            itemsArray.sort(this.sortDesc).map((x, i) => (
              <span key={i}>
                <Row
                  center="xs"
                  style={{ padding: '0 1rem', background: this.props.highlightUser === x.name ? '#ffca27' : '' }}
                >
                  <Col
                    xs={1}
                    style={{ textAlign: 'left', color: this.props.highlightUser === x.name ? '#fff' : '#888' }}
                  >
                    <p style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem', marginBottom: 0 }}>{i + 1}</p>
                  </Col>
                  <Col
                    xs={8}
                    style={{
                      textAlign: 'left',
                      color: this.props.highlightUser === x.name ? '#fff' : '#888',
                      textTransform: 'capitalize',
                    }}
                  >
                    <p style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem', marginBottom: 0 }}>{x.name}</p>
                  </Col>
                  <Col
                    xs={3}
                    style={{ textAlign: 'right', color: this.props.highlightUser === x.name ? '#fff' : '#888' }}
                  >
                    <p style={{ paddingBottom: '0.5rem', paddingTop: '0.5rem', marginBottom: 0 }}>
                      {this.props.songWinners ? x.current_song_score : x.total_score}
                    </p>
                  </Col>
                </Row>
              </span>
            ))}
        </Container>
        <br />
      </div>
    )
  }
}

export default LeaderBoardTable
