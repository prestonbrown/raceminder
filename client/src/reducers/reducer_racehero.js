//import _ from 'lodash';
import dotProp from 'dot-prop-immutable';

import { 
  REFRESH_RACEHERO_STARTED, 
  REFRESH_RACEHERO_SUCCESS, 
  REFRESH_RACEHERO_ERROR,
  CONNECT_RACEHERO_SOCKET_ERROR,
  RACEHERO_SOCKET_PUSH
} from '../actions/index';

const initialState = localStorage.getItem('racehero') ? JSON.parse(localStorage.getItem('racehero')) : {};

export default function(state = initialState, action) {
  let newState = null;
  switch(action.type) {
    case REFRESH_RACEHERO_SUCCESS:
    case RACEHERO_SOCKET_PUSH: {
      let { raceId, data } = action.payload;
      newState = { ...state, [raceId]: data };
      newState = dotProp.delete(newState, 'error');
      return newState;
    }
    case CONNECT_RACEHERO_SOCKET_ERROR:
    case REFRESH_RACEHERO_ERROR: {
      console.log('in reducer for refresh/connect racehero_error, payload:', action.payload)
      let { raceId, error } = action.payload;
      let data = Object.assign({}, state[raceId]);
      data.error = error.message;
      newState = { ...state, [raceId]: data };
      localStorage.setItem('racehero', JSON.stringify(newState));
      return newState;
    }
    case REFRESH_RACEHERO_STARTED:
    default:
    return state;
  }
}