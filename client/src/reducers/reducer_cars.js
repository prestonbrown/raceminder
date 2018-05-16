import _ from 'lodash';

import { FETCH_CARS, CREATE_CAR, DELETE_CAR } from '../actions/index';

//const initialState = localStorage.getItem('cars') ? JSON.parse(localStorage.getItem('cars')) : {};
const initialState = {};

export default function(state = initialState, action) {
  let newState = null;
  //console.log('in cars reducer, existing state:',state,', action:',action);
  switch(action.type) {
    case FETCH_CARS: {
      return action.payload;
    }    
    case CREATE_CAR: {
      let car = action.payload;
      let carId = null;

      if (!car.id) {
        // need to create a random id
        carId = _.size(state) + 1;
        car.id = carId;
      } else {
        carId = car.id;
      }

      newState = { ...state, [carId]: car };
      //localStorage.setItem('cars', JSON.stringify(newState));
      return newState;
    }

    case DELETE_CAR: {
      newState = _.omit(state, action.payload);
      //localStorage.setItem('cars', JSON.stringify(newState));
      return newState;
    }

    default:
    return state;
  }
}