import _ from 'lodash';
import dotProp from 'dot-prop-immutable';

import { 
  FETCH_RACES,
  CREATE_RACE, DELETE_RACE, 
  CREATE_RACE_STOP, DELETE_RACE_STOP,
  CREATE_RACE_STINT, DELETE_RACE_STINT,
  SET_SELECTED_STINT, SET_SELECTED_STOP
} from '../actions/index';

//let initialState = localStorage.getItem('races') ? JSON.parse(localStorage.getItem('races')) : {};
let initialState = {};

export default function (state = initialState, action) {
  let newState = null;
  switch (action.type) {
    case FETCH_RACES: {
      return action.payload;
    }
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
      //localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case DELETE_RACE: {
      newState = _.omit(state, action.payload);
      //localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case CREATE_RACE_STOP: {
      let { raceId, carId, values } = action.payload;
      let stopId = null;

      // lookup the correct race
      if (!values.id) {
        //stopId = createStopId(race);
        //values.id = stopId;
      } else {
        stopId = values.id;
      }

      // add the stop to the race
      newState = dotProp.set(state, `${raceId}.stops.${carId}.${stopId}`, values);
      newState = dotProp.set(newState, `${raceId}.selectedStopId`, stopId);

      //localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case DELETE_RACE_STOP: {
      let { raceId, carId, stopId } = action.payload;

      newState = dotProp.delete(state, `${raceId}.stops.${carId}.${stopId}`);
      newState = dotProp.set(newState, `${raceId}.selectedStopId`, null);

      //localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case SET_SELECTED_STOP: {
      let { raceId, carId, stopId } = action.payload;

      newState = dotProp.set(state, `${raceId}.selectedStopId`, stopId);
      return newState;
    }

    case CREATE_RACE_STINT: {
      let { raceId, carId, values } = action.payload;
      let stintId = null;

      // lookup the correct race
      if (!values.id) {
        //stintId = createStintId(race);
        //values.id = stintId;
      } else {
        stintId = values.id;
      }

      // add or update the stint to the race
      newState = dotProp.set(state, `${raceId}.stints.${carId}.${stintId}`, values);
      newState = dotProp.set(newState, `${raceId}.selectedStintId`, stintId);

      //localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case DELETE_RACE_STINT: {
      let { raceId, carId, stintId } = action.payload;

      newState = dotProp.delete(state, `${raceId}.stints.${carId}.${stintId}`);
      newState = dotProp.set(newState, `${raceId}.selectedStintId`, null);

      //localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }

    case SET_SELECTED_STINT: {
      let { raceId, carId, stintId } = action.payload;

      newState = dotProp.set(state, `${raceId}.selectedStintId`, stintId);
      return newState;
    }

    default: {
      return state;
    }
  }
}