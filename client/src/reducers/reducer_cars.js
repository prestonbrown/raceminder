import _ from 'lodash';

import { CREATE_CAR, DELETE_CAR } from '../actions/index';

const initialState = localStorage.getItem('cars') ? JSON.parse(localStorage.getItem('cars')) : {};

export default function(state = initialState, action) {
  let newState = null;
  switch(action.type) {
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
      localStorage.setItem('cars', JSON.stringify(newState));
      return newState;
    }

    case DELETE_CAR: {
      newState = _.omit(state, action.payload);
      localStorage.setItem('cars', JSON.stringify(newState));
      return newState;
    }

    default:
    return state;
  }
}