import _ from 'lodash';

import { CREATE_CAR } from '../actions/index';

const initialState = localStorage.getItem('cars') ? JSON.parse(localStorage.getItem('cars')) : {};

export default function(state = initialState, action) {
  switch(action.type) {
    case CREATE_CAR: {
      //console.log('in car reducer CREATE_CAR action:',action);
      // need to create a random id
      const carId = _.size(state) + 1;
      const car = action.payload;
      car.id = carId;
      const newState = { ...state, [carId]: car };
      localStorage.setItem('cars', JSON.stringify(newState));
      return newState;
    }
    default:
    return state;
    break;
  }
}