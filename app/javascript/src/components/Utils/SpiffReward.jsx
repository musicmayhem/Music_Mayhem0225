import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col } from 'react-flexbox-grid'
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { Field, reduxForm } from 'redux-form'
import Swal from 'sweetalert2'
import { instantRequest } from '../../actions/gameAction'

const renderCheckBoxField = ({ input, label, meta: { error }, ...custom }) => (
  <FormGroup className="game-config-checkbox-css" style={{ color: 'grey' }}>
    <Label style={{ margin: '0.4rem 1rem', fontSize: 'large' }}>{label}</Label>
    <Input {...input} {...custom} type="checkbox" style={{ color: '#ffca27' }} />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="custom-form-field-w-label-white">
    <Label>{label}</Label>
    <Input
      {...input}
      {...custom}
      onChange={input.onChange}
      value={input.value}
      type={custom.type}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
      style={{ color: '#ffca27' }}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class RewardSpiff extends Component {
  state = {
    showSpiffCheckBox: true,
    showSpiffValue: false,
    showSpiffField: false,
  }

  UNSAFE_componentWillMount() {
    if (this.props.winner) {
      this.props
        .instantRequest('games/update_spiff', {
          values: { game: { code: this.props.code }, getSpiffValue: true },
        })
        .then(res => {
          if (res && res.value != null) {
            this._spiffValue = res.value
            this.setState({ showSpiffField: false, showSpiffValue: true, showSpiffCheckBox: false })
          }
        })
    }
  }

  _spiffValue = null

  setSpiffValue = data => {
    if (data.spiff_value) {
      this._spiffValue = data.spiff_value
      var element = document.getElementById('spiffCheckBox')
      if (element) {
        element.checked = false
        element.value = false
      }
      if (this.props.winner) {
        this.props
          .instantRequest('games/update_spiff', {
            values: { game: { code: this.props.code }, spiff: data.spiff_value },
          })
          .then(res => {
            if (res) {
              Swal.fire({
                type: 'success',
                title: 'Prize value set Successfully',
                showConfirmButton: false,
                timer: 1500,
              })
              this.setState({ showSpiffField: false, showSpiffValue: true, showSpiffCheckBox: false })
            }
          })
      }
    } else {
      Swal.fire({
        type: 'warning',
        title: 'Prize value is required',
        showConfirmButton: false,
        timer: 1500,
      })
    }
  }

  removeSpiff() {
    this.props
      .instantRequest('games/update_spiff', {
        values: { game: { code: this.props.code }, spiff: null },
      })
      .then(res => {
        if (res) {
          Swal.fire({
            type: 'warning',
            title: 'Prize value removed Successfully',
            showConfirmButton: false,
            timer: 1500,
          })
          this._spiffValue = null
          this.setState({ showSpiffCheckBox: true, showSpiffValue: false })
        }
      })
  }

  render() {
    const { showSpiffCheckBox, showSpiffValue, showSpiffField } = this.state
    const { handleSubmit } = this.props
    return (
      <div>
        {showSpiffCheckBox && (
          <Field
            id="spiffCheckBox"
            name="spiffCheckBox"
            component={renderCheckBoxField}
            label="SET GAME PRIZE"
            onChange={() => {
              this.setState({ showSpiffField: !this.state.showSpiffField, showSpiffValue: false })
            }}
          />
        )}
        {showSpiffField && (
          <form onSubmit={handleSubmit(this.setSpiffValue)}>
            <Row>
              <Col xs={6} style={{ background: '#fff', padding: '1rem' }}>
                <Field
                  style={{ width: '50%' }}
                  name="spiff_value"
                  component={renderTextField}
                  label="ENTER PRIZE VALUE"
                  autoFocus
                />
              </Col>
              <Col xs={6} style={{ background: '#fff', padding: '1rem' }}>
                <button className="mayhem-btn-blue btn-full-width" type="submit" style={{ height: '80%' }}>
                SET GAME PRIZE
                </button>
              </Col>
            </Row>
          </form>
        )}
        {showSpiffValue && (
          <div style={{ margin: '2rem 0' }}>
            <h5 style={{ fontWeight: 'bold', float: 'left ', color: 'lightskyblue' }}>Prize : {this._spiffValue}</h5>
            <button
              type="button"
              className="fa fa-remove"
              style={{
                top: '-4rem',
                background: ' none',
                border: 'none',
                color: 'lightskyblue',
              }}
              onClick={() => {
                this.removeSpiff()
              }}
            />
          </div>
        )}
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    instantRequest: (path, params) => dispatch(instantRequest(path, params)),
  }
}

const WinnerReward = reduxForm({
  form: 'rewardForm',
  enableReinitialize: true,
})(RewardSpiff)

export default connect(
  state => {
    return {
      auth: state.auth,
    }
  },
  mapDispatchToProps
)(WinnerReward)
