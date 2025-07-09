import React from 'react'
import { Container } from 'reactstrap'
import { Row, Col } from 'react-flexbox-grid'
import Modal from 'react-responsive-modal'
import { Field, reduxForm } from 'redux-form'
import { FormGroup, Label, Input, FormFeedback } from 'reactstrap'
import { postRequest, gamePlayers  } from '../actions/gameAction'

const renderSelectField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup className="custom-form-field-w-label">
    <Label style={{color: 'black'}}>{label}</Label>
    <Input {...input} {...custom} type="select" style={{ color: '#ffca27' }}>
      {custom.options}
    </Input>
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)
const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <FormGroup {...input} {...custom}>
    <Label>{label}</Label>
    <Input
      autoFocus={custom.autoFocus}
      onChange={input.onChange}
      value={input.value}
      invalid={touched && error ? true : false}
      placeholder={custom.placeholder}
    />
    <FormFeedback>{error}</FormFeedback>
  </FormGroup>
)

class ChatModal extends React.Component {

  state={
    gamePlayers: null,
  }

  UNSAFE_componentWillMount(){
    this.props.dispatch(gamePlayers({ game: { code: this.props.code, chat: true } }))
      .then(res => {
        if (res && res.allPlayers && res.allPlayers.length > 0) {
          let gamePlayers = res.allPlayers
          this.setState({ gamePlayers: gamePlayers })
        }
      }
    )
  }

  sendMessage = (values) => {
    if(values['message']){
      this.props.dispatch(postRequest('games/send_message', { values: { game: { code: this.props.code, message_to: values['message_to'], message: values['message'] } }}))
      this.props.closeModal()
    }
  }

  render() {
    const { handleSubmit } = this.props
    const { gamePlayers } = this.state
    return (
      <Modal
        open={true}
        center
        onClose={()=> {
          this.props.closeModal()
        }}
      >
        <div style={{ textAlign: 'center', margin: '30px' }}>
          <Container
            style={{
              borderTop: '1px solid #ddd',
              borderBottom: '1px solid #ddd',
              padding: '1.5rem 0.5rem',
            }}
          >
            <Row start={'xs'}>
              <Col sm={12} style={{ textAlign: 'center' }}>
                <p style={{ color: '#210344', fontSize: '3vmax' }}>Game Chatting</p>
                  <div>
                    <form onSubmit={handleSubmit(this.sendMessage)}>
                    <Row>
                      <Col xs={12} style={{ textAlign: 'center' }}>
                      <Field
                        name="message_to"
                        component={renderSelectField}
                        options={
                          gamePlayers
                            ? gamePlayers.map(p => (
                                <option key={p[0]} value={p[0]}>
                                  {' '}
                                  {p[1]}{' '}
                                </option>
                              ))
                            : ''
                        }
                        label="To"
                        autoFocus={true}
                      />
                      <Field
                        name="message"
                        component={renderTextField}
                        label="Write Message"
                        className="custom-form-field-w-label-white "
                        autoFocus={this._focus}
                      />
                    </Col>
                   </Row>
                    <Row>
                     <Col sm={6}>
                       <button
                         style={{marginTop: '10px'}}
                         id='config-start-btn'
                         className="mayhem-btn-blue btn-full-width"
                         type="submit">
                         SEND!
                       </button>
                     </Col>
                     <Col sm={6}>
                      <button className="mayhem-btn-blue btn-full-width"
                        style={{marginTop: '10px', backgroundColor: 'red'}}
                        onClick={()=> this.props.closeModal()}
                        >
                        CANCEL
                      </button>
                    </Col>
                   </Row>
                  </form>
                  </div>
              </Col>
            </Row>
          </Container>
        </div>
      </Modal>
    )
  }
}

const ChatForm = reduxForm({
  form: 'ChatForm',
})(ChatModal)

export default ChatForm
