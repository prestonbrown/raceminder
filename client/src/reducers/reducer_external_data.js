import _ from 'lodash';
import dotProp from 'dot-prop-immutable';

import { 
  REFRESH_RACEHERO_STARTED, 
  REFRESH_RACEHERO_SUCCESS, 
  REFRESH_RACEHERO_ERROR,
  CONNECT_RACEHERO_SOCKET_ERROR,
  RACEHERO_SOCKET_PUSH,

  CONNECT_RACEMONITOR_SOCKET_ERROR,
  RACEMONITOR_SOCKET_PUSH
} from '../actions/index';

const initialState = localStorage.getItem('externalData') ? JSON.parse(localStorage.getItem('externalData')) : { racehero: {}, racemonitor: {}};

// Return array of string values, or NULL if CSV string not well formed.
function CSVtoArray(text) {
    var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;
    var a = [];                     // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
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
  switch(action.type) {
    case REFRESH_RACEHERO_SUCCESS:
    case RACEHERO_SOCKET_PUSH: {
      let { raceId, data } = action.payload;
      // retrieve current racer sessions from state
      let newSessions = Object.assign({}, state.racehero[raceId] ? state.racehero[raceId].racer_sessions : []);
      //console.log('current sessions:',newSessions);

      if (!data.racer_sessions) {
        console.log('racehero reducer got weird data without racer_sessions:',data);
      } else {
      // new sessions
      for (const session of data.racer_sessions) {
        newSessions = _.filter(newSessions, s => s.racer_session_id !== session.racer_session_id);
        newSessions.push(session);
      }
      }

      //console.log('current sessions after append:',newSessions);
      // now append the new sessions
      data.racer_sessions = newSessions;

      let newPassings = Object.assign({}, state.racehero[raceId] ? state.racehero[raceId].passings : []);
      if (!data.passings) {
        console.log('racehero reducer got weird data without passings:',data);
      } else {
      for (const passing of data.passings) {
        newPassings = _.filter(newPassings, s => s.racer_session_id !== passing.racer_session_id);
        newPassings.push(passing);
      }
      } 

      // now append the new sessions
      data.passings = newPassings;

      newState = dotProp.set(state, `racehero.${raceId}`, data);
      localStorage.setItem('externalData', JSON.stringify(newState));

      console.log('new racehero state:', newState);
      return newState;
    }
    case CONNECT_RACEHERO_SOCKET_ERROR:
    case REFRESH_RACEHERO_ERROR: {
      console.log('in reducer for refresh/connect racehero_error, payload:', action.payload)
      let { raceId, error } = action.payload;
      let data = Object.assign({}, state.racehero[raceId]);
      data.error = error.message;
      newState = dotProp.set(state, `racehero.${raceId}`, data);
      localStorage.setItem('externalData', JSON.stringify(newState));
      return newState;
    }
    case CONNECT_RACEMONITOR_SOCKET_ERROR: {
      console.log('in reducer for connect race monitor socket error, payload:',action.payload);
      let { raceId, error } = action.payload;
      let data = Object.assign({}, state[raceId]);
      data.error = error.message;
      newState = dotProp.set(state, `racemonitor.${raceId}`, data);
      localStorage.setItem('externalData', JSON.stringify(newState));
      return newState;
    }
    case RACEMONITOR_SOCKET_PUSH: {
      let { raceId, data } = action.payload;
      data = CSVtoArray(data);
      const carNum = parseInt(data[1], 10);
      const lap = parseInt(data[2], 10);
      const position = parseInt(data[3], 10);
      const lapTime = data[4];
      const flag = data[5].trim();


      //console.log('got race monitor push:',data);
      newState = dotProp.set(state, `racemonitor.${raceId}.laps.${carNum}`, 
        { number: carNum, lap, position, lapTime, flag }); //list => [ ...list, data ]);
      newState = dotProp.delete(newState, `racemonitor.${raceId}.error`);
      localStorage.setItem('externalData', JSON.stringify(newState));
      return newState;
    }
    case REFRESH_RACEHERO_STARTED:
    default:
    return state;
  }
}