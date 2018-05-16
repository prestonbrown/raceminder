import _ from 'lodash';

import { FETCH_DRIVERS, CREATE_DRIVER, DELETE_DRIVER } from '../actions/index';

//let initialState = localStorage.getItem('drivers') ? JSON.parse(localStorage.getItem('drivers')) : {};
let initialState = {};

export default function(state = initialState, action) {
  let newState = null;

  switch(action.type) {
    case FETCH_DRIVERS: {
      return action.payload;
    }
    case CREATE_DRIVER: {
      let driver = action.payload;
      let driverId = null;

      if (!driver.id) {
        // need to create a random id
        driverId = _.size(state) + 1;
        driver.id = driverId;
      } else {
        driverId = driver.id;
      }

      newState = { ...state, [driverId]: driver };
      //localStorage.setItem('drivers', JSON.stringify(newState));
      return newState;
    }

    case DELETE_DRIVER: {
      newState = _.omit(state, action.payload);
      //localStorage.setItem('drivers', JSON.stringify(newState));
      return newState;      
    }

    default: {
      return state;
    }
  }
}