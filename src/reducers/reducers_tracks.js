import _ from 'lodash';

import { SELECT_DRIVER } from '../actions/index';

const initialState = {
    1: { 
      id: 1,
      name: 'VIR Full',
      length: 3.27
    },
    2: {
      id: 2,
      name: 'VIR North',
      length: 2.25
    },
    3: {
      id: 3,
      name: 'Road Atlanta',
      length: 2.54
    },
    4: {
      id: 4,
      name: 'Watkins Glen International',
      length: 3.4
    }
};

export default function(state = initialState, action) {
  switch(action.type) {
    default:
    return state;
    break;
  }
}