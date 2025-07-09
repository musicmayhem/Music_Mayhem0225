import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import reducer from '../reducers/index'

const configureStore = props => createStore(reducer, props, applyMiddleware(thunk))

export default configureStore
