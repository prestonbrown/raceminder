import { combineReducers } from 'redux';
import driversReducer from './reducer_drivers';
import carsReducer from './reducer_cars';
import tracksReducer from './reducer_tracks';
import racesReducer from './reducer_races';
import externalDataReducer from './reducer_external_data';

import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
	drivers: driversReducer,
  cars: carsReducer,
  tracks: tracksReducer,
  races: racesReducer,
  form: formReducer,
  externalData: externalDataReducer
});

export default rootReducer;
