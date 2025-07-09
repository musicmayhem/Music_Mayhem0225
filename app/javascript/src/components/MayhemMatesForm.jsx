import React from 'react'
import { Button } from 'reactstrap'

class MayhemMatesForm extends React.Component {

  render() {
    return (
      <div>
        <Button
          style={{ fontWeight: 'bold' }}
          color="info"
          size="lg"
          block
          type="submit"
        >
          START
        </Button>
      </div>
    )
  }
}

export default MayhemMatesForm
