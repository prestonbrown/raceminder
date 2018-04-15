import _ from 'lodash';

import { CREATE_RACE } from '../actions/index';

let initialState = localStorage.getItem('races') ? JSON.parse(localStorage.getItem('races')) : {};

export default function(state = initialState, action) {
  switch(action.type) {
    case CREATE_RACE: {
      // need to create a random id
      const raceId = _.size(state) + 1;
      const race = action.payload;
      race.id = raceId;

      // remove extra info we just need IDs.
      race.drivers = race.drivers.map(driver => { return driver.id });
      const newState = { ...state, [raceId]: race };
      localStorage.setItem('races', JSON.stringify(newState));
      return newState;
    }
    default:
    return state;
    break;
  }
}