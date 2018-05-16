import _ from 'lodash';

import { FETCH_TRACKS } from '../actions';

let initialState = {}
//initialState = localStorage.getItem('tracks') ? JSON.parse(localStorage.getItem('tracks')) : initialState;

export default function(state = initialState, action) {
  switch(action.type) {
    case FETCH_TRACKS: {
      return action.payload;
    }
    default:
    return state;
  }
}