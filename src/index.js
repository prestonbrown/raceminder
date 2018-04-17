import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { compose, createStore, applyMiddleware } from 'redux';

//import fontawesome from '@fortawesome/fontawesome';
//import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import reduxPromise from 'redux-promise';

import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import App from './App';
import reducers from './reducers';
import registerServiceWorker from './registerServiceWorker';

//import DevTools from './components/DevTools';

//const createStoreWithMiddleware = compose(applyMiddleware(reduxPromise), DevTools.instrument())(createStore);
const createStoreWithMiddleware = applyMiddleware(reduxPromise)(createStore);

ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducers)}>
    <App />
  </Provider>
  , document.getElementById('root'));
registerServiceWorker();
