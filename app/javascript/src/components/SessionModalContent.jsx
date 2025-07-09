import React from 'react'
import { Button, FormGroup, Label, Input } from 'reactstrap'
import { makeRequest, postRequest, getDefaultTime } from '../actions/gameAction'
import { connect } from 'react-redux'
import { SERIES_OPTIONS, GET_OPEN_SERIES_LIST_SUCCESS, GET_SERIES_DETAIL } from '../constants/gameConstants'

class SessionModalContent extends React.Component {
  state = {
    name: getDefaultTime(),
    seriesName: null,
    seriesDescription: null,
    description: null,
    openSeriesModel: false,
    openSeriesSessionModel: false,
    sessionSeriesName: null,
    addSeries: false,
  }

  UNSAFE_componentWillMount() {
    this.props.makeRequest('games/get_open_series_list', { type: GET_OPEN_SERIES_LIST_SUCCESS })
  }

  modalValues = () => {
    var values = {
      name: this.state.name || getDefaultTime(),
      description: this.state.description,
      sessionSeriesName: this.state.sessionSeriesName,
      seriesData: { name: this.state.seriesName, description: this.state.seriesDescription },
    }
    this.props.newSessionValues(values)
  }

  seriesRequest = p => {
    if (p !== 'SELECT SERIES') {
      switch (p) {
        case 'NEW SERIES':
          this.setState({ openSeriesModel: true })
          break
        default:
          this.setState({ openSeriesSessionModel: true, sessionSeriesName: p })
          this.props.postRequest('games/get_series_detail', { type: GET_SERIES_DETAIL, values: { series_id: p } })
          break
      }
    }
  }
  render() {
    let seriesOptions = null
    let seriesData =
      this.props.game.seriesList && this.props.game.seriesList.length > 0 && this.props.game.seriesList.map(x => x.name)
    if (seriesData)
      seriesOptions = SERIES_OPTIONS.concat(seriesData).map((series, index) => <option key={index}> {series} </option>)
    else seriesOptions = SERIES_OPTIONS.map((series, index) => <option key={index}> {series} </option>)

    const { openSeriesModel, addSeries } = this.state
    return (
      <div>
        <FormGroup>
          <Label>Name</Label>
          <Input
            name="session.name"
            type="text"
            placeholder="ENTER SESSION NAME"
            autoFocus
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <Label>DESCRIPTION</Label>
          <Input
            name="session.description"
            type="text"
            placeholder="ENTER SESS DESCRIPTION"
            onChange={e => this.setState({ description: e.target.value })}
          />
        </FormGroup>
        <div
          className="remember-me"
          onClick={() => {
            this.setState({ addSeries: !this.state.addSeries })
          }}
        >
          <div>{this.state.addSeries && <i style={{ color: 'black' }} className="fa fa-check" />} </div>
          <label style={{ color: 'black', marginBottom: '0 !important' }}>Series Options?</label>
        </div>
        <div>
          {addSeries && (
            <FormGroup>
              <Input
                style={{ height: '40px!important' }}
                name="session.series_data"
                type="select"
                onChange={p => this.seriesRequest(p.target.value)}
              >
                {seriesOptions}
              </Input>
            </FormGroup>
          )}

          {openSeriesModel && (
            <div>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  name="series.name"
                  type="text"
                  placeholder="ENTER SERIES NAME"
                  autoFocus
                  onChange={e => this.setState({ seriesName: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>DESCRIPTION</Label>
                <Input
                  name="series.description"
                  type="text"
                  placeholder="ENTER SERIES DESCRIPTION"
                  onChange={e => this.setState({ seriesDescription: e.target.value })}
                />
              </FormGroup>
            </div>
          )}
          <Button onClick={this.modalValues}>Submit</Button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    makeRequest: (path, params) => dispatch(makeRequest(path, params)),
    postRequest: (path, params) => dispatch(postRequest(path, params)),
  }
}

export default connect(
  state => {
    return {
      game: state.game,
    }
  },
  mapDispatchToProps
)(SessionModalContent)
