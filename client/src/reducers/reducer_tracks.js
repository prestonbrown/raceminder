import _ from 'lodash';

import { FETCH_TRACKS, CREATE_TRACK, DELETE_TRACK } from '../actions';

let initialState = {}
//initialState = localStorage.getItem('tracks') ? JSON.parse(localStorage.getItem('tracks')) : initialState;

export default function(state = initialState, action) {
  let newState = null;

  switch(action.type) {
    case FETCH_TRACKS: {
      return action.payload;
    }
    case CREATE_TRACK: {
      let track = action.payload;
      let trackId = null;

      if (!track.id) {
        // need to create a random id
        track.id = trackId = _.size(state) + 1;
      } else {
        trackId = track.id;
      }

      newState = { ...state, [trackId]: track };
      //localStorage.setItem('tracks', JSON.stringify(newState));
      return newState;
    }

    case DELETE_TRACK: {
      newState = _.omit(state, action.payload);
      //localStorage.setItem('drivers', JSON.stringify(newState));
      return newState;      
    }

    default: {
      return state;
    }
  }
}