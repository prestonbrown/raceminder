import _ from 'lodash';

import { CREATE_RACE, DELETE_RACE } from '../actions/index';

let initialState = localStorage.getItem('races') ? JSON.parse(localStorage.getItem('races')) : {};

export default function (state = initialState, action) {
  let newState = null;
  switch (action.type) {
    case CREATE_RACE: {
      const race = action.payload;
      let raceId = null;

      if (!race.id) {
        // need to create a random id
        raceId = _.size(state) + 1;
        race.id = raceId;
      } else {
        raceId = race.id;
      }

      newState = { ...state, [raceId]: race };
      localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case DELETE_RACE: {
      newState = _.omit(state, action.payload);
      localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    default: {
      return state;
    }
  }
}