import _ from 'lodash';
import dotProp from 'dot-prop-immutable';
//import produce from 'immer';

import { REFRESH_RACEHERO_STARTED, REFRESH_RACEHERO_SUCCESS, 
  REFRESH_RACEHERO_ERROR, CONNECT_RACEHERO_SOCKET_ERROR, 
  RACEHERO_SOCKET_PUSH, FETCH_RACEHERO_LAP_DATA, CLEAR_RACEHERO_DATA, 
  CONNECT_RACEMONITOR_SOCKET_ERROR, RACEMONITOR_SOCKET_PUSH } from '../actions/index';

const initialState = localStorage.getItem('externalData') ? JSON.parse(localStorage.getItem('externalData')) : {
    racehero: {},
    racemonitor: {}
};

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
    case RACEHERO_SOCKET_PUSH: {
        let {raceId, data} = action.payload;
        let rhRaceState = state.racehero && state.racehero[raceId] ? _.cloneDeep(state.racehero[raceId]) : {};

        // clear any previous errors
        rhRaceState.error = null;

        // are we starting a new run but with the same race url (maybe only for the demo page)?
        // if so we need to clear out session and pass data
        if (data.live_run_id && (!rhRaceState.live_run_id ||
          rhRaceState.live_run_id !== data.live_run_id)) {
          rhRaceState.racer_sessions = [];
          rhRaceState.passings = [];
          rhRaceState.laps = {};
          rhRaceState.live_run_id = data.live_run_id;
        }

        if (!data.racer_sessions) {
            console.log('strange racehero event:',data);
            // flag event          
            rhRaceState.latest_flag = { flag_type: data.flag_type, color: data.color  };
        }

        if (data.racer_sessions) {
          //console.log('got racehero payload:',data);
          let sessions = rhRaceState.racer_sessions ? rhRaceState.racer_sessions : [];
          let passings = rhRaceState.passings ? rhRaceState.passings : [];

          // merge sessions
          for (const session of data.racer_sessions) {
            sessions = _.filter(sessions, s => s.racer_session_id !== session.racer_session_id);
            sessions.push(session);
          }

          // merge passings
          for (const passing of data.passings) {
            passings = _.filter(passings, s => s.racer_session_id !== passing.racer_session_id);
            passings.push(passing);
          }

          rhRaceState.passings = passings;
          rhRaceState.racer_sessions = sessions;
        }

        // now merge with overall state
        if (!state.racehero) {
          newState = dotProp.set(state, 'racehero', []);
        } else {
          newState = state;
        }
        newState = dotProp.set(newState, `racehero.${raceId}`, rhRaceState);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
    }

    case FETCH_RACEHERO_LAP_DATA: {
        //console.log('in reducer for fetch lap data, payload: ', action.payload);
        let {raceId, racerId, data} = action.payload;

        let laps = state.racehero[raceId] && state.racehero[raceId].laps ?
            _.cloneDeep(state.racehero[raceId].laps) :
            {};

        // merge lap data
        laps[racerId] = data;
        //console.log('laps are now:', laps);
        newState = dotProp.set(state, `racehero.${raceId}.laps`, laps);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
    }

    case CLEAR_RACEHERO_DATA: {
        let {raceId} = action.payload;
        //console.log('in reducer for clear racehero data, raceId: ' + raceId + '; payload: ', action.payload);
        newState = dotProp.set(state, `racehero.${raceId}`, {});
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
    }

    case CONNECT_RACEHERO_SOCKET_ERROR:
    case REFRESH_RACEHERO_ERROR: {
        console.log('in reducer for refresh/connect racehero_error, payload:', action.payload)
        let {raceId, error} = action.payload;

        newState = dotProp.set(state, `racehero.${raceId}.error`, error.message);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
    }

    case CONNECT_RACEMONITOR_SOCKET_ERROR: {
        console.log('in reducer for connect race monitor socket error, payload:', action.payload);
        let {raceId, error} = action.payload;
        let data = Object.assign({}, state[raceId]);
        data.error = error.message;
        newState = dotProp.set(state, `racemonitor.${raceId}`, data);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
    }
    
    case RACEMONITOR_SOCKET_PUSH: {
        let {raceId, data} = action.payload;
        data = CSVtoArray(data);
        const carNum = parseInt(data[1], 10);
        const lap = parseInt(data[2], 10);
        const position = parseInt(data[3], 10);
        const lapTime = data[4];
        const flag = data[5].trim();

        //console.log('got race monitor push:',data);
        newState = dotProp.set(state, `racemonitor.${raceId}.laps.${carNum}`, {
            number: carNum,
            lap,
            position,
            lapTime,
            flag
        }); //list => [ ...list, data ]);
        newState = dotProp.delete(newState, `racemonitor.${raceId}.error`);
        localStorage.setItem('externalData', JSON.stringify(newState));
        return newState;
    }
    case REFRESH_RACEHERO_STARTED:
    default:
        return state;
    }
}