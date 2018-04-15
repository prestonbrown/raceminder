import _ from 'lodash';

import { SELECT_DRIVER } from '../actions/index';

const initialState = {
  selectedDriverId: null,
  driverList: {
    1: { 
      id: 1,
      name: 'Preston Brown'
    },
    2: {
      id: 2,
      name: 'Cody Forbes'
    },
    3: {
      id: 3,
      name: 'Max Wobbles'
    },
    4: {
      id: 4,
      name: 'Peter Monin'
    },
    5: {
      id: 5,
      name: 'Sean Crane'
    },
    6: {
      id: 6,
      name: 'Jean-Sebastien Sauriol'
    },
    7: {
      id: 7,
      name: 'Tyler Rohrer'
    },
    8: {
      id: 8,
      name: 'Michael Reilly'
    }
  }
};

export default function(state = initialState, action) {
  switch(action.type) {
    case SELECT_DRIVER:
    return Object.assign({}, state, { selectedDriverId: action.payload });
    break;

    default:
    return state;
    break;
  }
}