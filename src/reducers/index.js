import { combineReducers } from 'redux';
import driversReducer from './reducer_drivers';
import { reducer as formReducer } from 'redux-form';

const rootReducer = combineReducers({
	drivers: driversReducer,
  form: formReducer
});

export default rootReducer;
