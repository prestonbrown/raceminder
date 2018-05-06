import _ from 'lodash';

import { 
  REFRESH_RACEHERO_STARTED, 
  REFRESH_RACEHERO_SUCCESS, 
  REFRESH_RACEHERO_ERROR 
} from '../actions/index';

const initialState = localStorage.getItem('racehero') ? JSON.parse(localStorage.getItem('racehero')) : {};

export default function(state = initialState, action) {
  let newState = null;
  switch(action.type) {
    case REFRESH_RACEHERO_SUCCESS: {
      let { raceId, data } = action.payload;
      newState = { ...state, [raceId]: data };
      localStorage.setItem('racehero', JSON.stringify(newState));
      return newState;
    }
    default:
    return state;
  }
}