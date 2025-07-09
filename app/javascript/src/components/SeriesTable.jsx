import React from 'react'
import { Table } from 'reactstrap'
import { connect } from 'react-redux'
import { postRequest } from '../actions/gameAction'
import { FormGroup, Input } from 'reactstrap'
import { GET_SERIES_SCORE } from '../constants/gameConstants'
import { checkUserIsLogin } from '../actions/loginActions'

class SeriesTable extends React.Component {
  state = {
    tableData: null,
    role: null,
  }

  UNSAFE_componentWillMount() {
    this.props.checkUserIsLogin().then(res => {
      if (res) {
        this.setState({ role: res.account.role })
        this.props.postRequest('player/find_scores', {
          type: GET_SERIES_SCORE,
          values: { game: { code: this.props.match.params.game_code } },
        })
      } else {
        this.props.history.push('/')
      }
    })
  }

  UNSAFE_componentWillReceiveProps(np) {
    if (!this.props.game.seriesScore && np.game.seriesScore) {
      if (Object.values(np.game.seriesScore).length > 0)
        this.setState({ tableData: Object.values(np.game.seriesScore)[0] })
    }
  }

  sessionRequest = (p, q) => {
    this.setState({ tableData: q[p] })
  }

  render() {
    const { tableData, role } = this.state
    let seriesOptions = null
    let seriesData = this.props.game.seriesScore
    let seriesScore = this.props.game.seriesWiseScore
    if (seriesData) seriesOptions = Object.entries(seriesData).map(k => <option key={k}> {k[0]} </option>)

    return (
      <div style={{ backgroundColor: 'white', margin: '2rem' }}>
        <div style={{ padding: '1.5rem' }}>
          <h2 style={{ textAlign: 'center', fontWeight: 'bold', margin: '0.4rem 0', color: '#6c757d' }}>
            League Leaderboard
          </h2>
          <Table hover borderless style={{ marginBottom: '0', maxHeight: '100px', overflow: 'scroll' }}>
            <tbody>
              {seriesScore &&
                Object.keys(seriesScore).length > 0 &&
                Object.entries(seriesScore).map((x, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{x[0]}</td>
                    {role == 'host' && <td>{x[1]}</td>}
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
        <h2
          className="font-light"
          style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#6c757d', paddingLeft: '1rem' }}
        >
          Weekly Scores:
        </h2>
        <FormGroup
          style={{
            backgroundColor: '#f2f2f2',
            color: '#a3a4ae',
            borderBottom: '2px solid #4b4f63',
            margin: '1rem',
          }}
        >
          <h6 style={{ color: '#6c757d', padding: '8px 0px 0 8px', margin: '0px' }}>
            <b>Select Game Session:</b>
          </h6>
          <div className="score-select-field">
            <Input
              name="session.series_data"
              type="select"
              onChange={p => this.sessionRequest(p.target.value, seriesData)}
            >
              {seriesOptions}
            </Input>
          </div>
        </FormGroup>
        <div style={{ paddingTop: '10px', marginTop: '2rem', paddingBottom: '3rem', padding: '1.5rem' }}>
          {tableData && <h2 style={{ textAlign: 'center', margin: '0.4rem 0', color: '#6c757d' }}>Game Scores</h2>}
          <Table hover borderless style={{ marginBottom: '0' }}>
            <tbody>
              {tableData &&
                Object.keys(tableData).length > 0 &&
                Object.entries(tableData).map((x, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{x[0]}</td>
                    {role == 'host' && <td>{x[1]}</td>}
                  </tr>
                ))}
            </tbody>
          </Table>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    checkUserIsLogin: () => dispatch(checkUserIsLogin()),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}
export default connect(
  state => {
    return {
      game: state.game,
      auth: state.auth,
    }
  },
  mapDispatchToProps
)(SeriesTable)
