import React from 'react'
import { Button } from 'reactstrap'
import { Field } from 'redux-form'
import { GET_TRIVIA_ASSETS } from '../constants/gameConstants'

class TriviaForm extends React.Component {

  state={
    triviaAssets: [],
    triviaURLs: [],
  }

  UNSAFE_componentWillMount(){
    this.props.makeRequest('games/get_trivia_assets', { type: GET_TRIVIA_ASSETS })
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
     if(!this.props.trivia_url && this.state.triviaURLs.includes(nextProps.trivia_url))
       this.props.startTrivia()
     if(this.state.triviaAssets.length == 0 && nextProps.game && nextProps.game.trivia_assets && nextProps.game.trivia_assets.length > 0){
       let triviaUrls = nextProps.game.trivia_assets.map(x => x.iframe_url)
       this.setState({ triviaAssets: nextProps.game.trivia_assets, triviaURLs: triviaUrls })
     }
  }

  render() {
    const { textField } = this.props
    const { triviaAssets } = this.state
    return (
      <div>
        <h6 style={{ color: '#eee' }}> <b>Select A Link:</b></h6>
        {triviaAssets && triviaAssets.length > 0 &&
          triviaAssets.map(x => (
            <div key={x.id}>
              <a
                style={{ color: '#eee' }}
                onClick={()=> {
                  this.props.changeFieldValue("game.trivia_url" , x.iframe_url)
                }}
              >{x.name}</a>
            </div>
          ))
        }
        <br/>
        <p style={{ color: '#ccc', fontSize: '2.2vmax' }}>Or Manually Enter URL:</p>
        <Field
          name="game.trivia_url"
          className="custom-form-field-w-label "
          component={textField}
          label="TRIVIA URL"
          type="text"
          autoFocus
        />
        <Button style={{ fontWeight: 'bold' }} color="info" size="lg" block type="submit">
          START
        </Button>
      </div>
    )
  }
}

export default TriviaForm
