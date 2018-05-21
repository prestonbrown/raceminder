import _ from 'lodash';
import dotProp from 'dot-prop-immutable';
import produce from 'immer';

import {
  REFRESH_RACEHERO_STARTED,
  REFRESH_RACEHERO_SUCCESS,
  REFRESH_RACEHERO_ERROR,
  CONNECT_RACEHERO_SOCKET_ERROR,
  RACEHERO_SOCKET_PUSH,

  CONNECT_RACEMONITOR_SOCKET_ERROR,
  RACEMONITOR_SOCKET_PUSH
} from '../actions/index';

const initialState = localStorage.getItem('externalData') ? JSON.parse(localStorage.getItem('externalData')) : { racehero: {}, racemonitor: {} };

// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
  var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
  var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
  // Return NULL if input string is not well formed CSV string.
  if (!re_valid.test(text)) return null;
  var a = []; // Initialize array to receive values.
  text.replace(re_value, // "Walk" the string using replace with callback.
    function(m0, m1, m2, m3) {
      // Remove backslash from \' in single quoted values.
      if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
      // Remove backslash from \" in double quoted values.
      else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
      else if (m3 !== undefined) a.push(m3);
      return ''; // Return empty string.
    });
  // Handle special case of empty last value.
  if (/,\s*$/.test(text)) a.push('');
  return a;
}

export default function(state = initialState, action) {
  let newState = null;
  switch (action.type) {
    case REFRESH_RACEHERO_SUCCESS:
    case RACEHERO_SOCKET_PUSH:
      {
        let { raceId, data } = action.payload;

        if (!data.racer_sessions) {
          // flag event          
          newState = dotProp.set(state, `racehero.${raceId}.color`, data.color);
          newState = dotProp.set(newState, `racehero.${raceId}.flag_type`, data.flag_type);
          newState = dotProp.set(newState, `racehero.${raceId}.html_class_name`, data.html_class_name);
          newState = dotProp.set(newState, `racehero.${raceId}.live_run_id`, data.live_run_id);
          return newState;
        }

        //console.log('got racehero payload:',data);
        newState = _.cloneDeep(data);

        let sessions = state.racehero[raceId] && state.racehero[raceId].racer_sessions 
          ? _.cloneDeep(state.racehero[raceId].racer_sessions) 
          : [];
        let passings = state.racehero[raceId] && state.racehero[raceId].passings 
          ? _.cloneDeep(state.racehero[raceId].passings) 
          : [];

        // merge sessions
        for (const session of newState.racer_sessions) {
          sessions = _.filter(sessions, s => s.racer_session_id !== session.racer_session_id);
          sessions.push(session);
        }

        // merge passings
        for (const passing of newState.passings) {
          passings = _.filter(passings, s => s.racer_session_id !== passing.racer_session_id);
          passings.push(passing);
        }

        newState.passings = passings;
        newState.racer_sessions = sessions;
        newState = dotProp.set(state, `racehero.${raceId}`, newState);

        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
      }
    case CONNECT_RACEHERO_SOCKET_ERROR:
    case REFRESH_RACEHERO_ERROR:
      {
        console.log('in reducer for refresh/connect racehero_error, payload:', action.payload)
        let { raceId, error } = action.payload;
        let data = Object.assign({}, state.racehero[raceId]);
        data.error = error.message;
        newState = dotProp.set(state, `racehero.${raceId}`, data);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
      }
    case CONNECT_RACEMONITOR_SOCKET_ERROR:
      {
        console.log('in reducer for connect race monitor socket error, payload:', action.payload);
        let { raceId, error } = action.payload;
        let data = Object.assign({}, state[raceId]);
        data.error = error.message;
        newState = dotProp.set(state, `racemonitor.${raceId}`, data);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
      }
    case RACEMONITOR_SOCKET_PUSH:
      {
        let { raceId, data } = action.payload;
        data = CSVtoArray(data);
        const carNum = parseInt(data[1], 10);
        const lap = parseInt(data[2], 10);
        const position = parseInt(data[3], 10);
        const lapTime = data[4];
        const flag = data[5].trim();


        //console.log('got race monitor push:',data);
        newState = dotProp.set(state, `racemonitor.${raceId}.laps.${carNum}`, { number: carNum, lap, position, lapTime, flag }); //list => [ ...list, data ]);
        newState = dotProp.delete(newState, `racemonitor.${raceId}.error`);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
      }
    case REFRESH_RACEHERO_STARTED:
    default:
      return state;
  }
}
