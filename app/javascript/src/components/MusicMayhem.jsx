import React from 'react'
import { Provider } from 'react-redux'
import configureStore from '../store/mayhemStore'
import Routes from '../routes/Routes'
import '../style/style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

class MusicMayhem extends React.Component {
  render() {
    return (
      <Provider store={configureStore()}>
        <div className="full-container">
          <Routes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnVisibilityChange
            draggable
            pauseOnHover
          />
        </div>
      </Provider>
    )
  }
}

export default MusicMayhem
