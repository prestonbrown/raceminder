import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

//import fontawesome from '@fortawesome/fontawesome';
//import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import reduxPromise from 'redux-promise';
import thunk from 'redux-thunk';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';
import { fetchTracks, fetchCars } from './actions';
import reducers from './reducers';
import registerServiceWorker from './registerServiceWorker';

import firebase from './firebase';

if (process.env.NODE_ENV !== 'production') {
  localStorage.setItem('debug', 'raceminder:*');
}

//import DevTools from './components/DevTools';

//const createStoreWithMiddleware = compose(applyMiddleware(reduxPromise), DevTools.instrument())(createStore);
const createStoreWithMiddleware = applyMiddleware(reduxPromise, thunk)(createStore);

const store = createStoreWithMiddleware(reducers);

store.dispatch(fetchTracks());
store.dispatch(fetchCars());

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>
  , document.getElementById('root'));
registerServiceWorker();
