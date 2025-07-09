import React, { Component } from 'react'
import { Collapse } from 'reactstrap'

class SongAdditionalInfo extends Component {

  render() {
    const { additionalData, collapse, song } = this.props
    return (
      <div>
        <Collapse style={{ color: 'green' }} isOpen={song.id == collapse}>
          {additionalData.single_data.length > 0 && (
            <div>
              <b>
                Single Info {' '}
              </b>
              <div style={{ color: 'brown' }} >
                {additionalData.single_data.map((sd, i)=> (
                  <div key={i} >{i+1}.{sd}</div>
                ))}
             </div>
           </div>
          )}
          {additionalData.double_data.length > 0 && (
            <div>
              <b>
                Combined Info {' '}
              </b>
              <div style={{ color: 'brown' }} >
                {additionalData.double_data.map((dd, i)=> (
                  <div key={i} >
                    <div>{i+1}.{dd[0]}, {dd[1]}</div>
                  </div>
                ))}
              </div>
           </div>
          )}
          {additionalData.question_answer_data.length > 0 && (
            <div>
              <b>
                Questions {' '}
              </b>
              <div style={{ color: 'brown' }} >
                {additionalData.question_answer_data.map((qa, i)=> (
                  <div key={i} >
                    <div>Q{i+1}.{qa[0]}</div>
                    <div>A{i+1}.{qa[1]}</div>
                  </div>
                ))}
             </div>
          </div>
          )}
        </Collapse>
      </div>
    )
  }
}

export default SongAdditionalInfo
