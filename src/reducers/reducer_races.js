import _ from 'lodash';

import { CREATE_RACE, DELETE_RACE, CREATE_RACE_STOP, DELETE_RACE_STOP } from '../actions/index';

let initialState = localStorage.getItem('races') ? JSON.parse(localStorage.getItem('races')) : {};

export default function (state = initialState, action) {
  let newState = null;
  switch (action.type) {
    case CREATE_RACE: {
      let race = action.payload;
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

    case CREATE_RACE_STOP: {
      let raceId = action.payload.raceId;
      let data = action.payload.data;
      let race = state.races[raceId];
      if (!race.stops) {
        race.stops = {}
      }
      let stopId = _.size(race.stops) + 1;
      data.id = stopId;
      race.stops[stopId] = data;

      newState = { ...state, [raceId]: race };
      localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case DELETE_RACE_STOP: {
      return state;
    }

    default: {
      return state;
    }
  }
}