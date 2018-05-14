/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import _ from 'lodash';
import Sockette from 'sockette';
import firebase from '../firebase';

export const CREATE_DRIVER = 'CREATE_DRIVER';
export const DELETE_DRIVER = 'DELETE_DRIVER';

export const CREATE_CAR = 'CREATE_CAR';
export const DELETE_CAR = 'DELETE_CAR';

export const CREATE_RACE = 'CREATE_RACE';
export const CREATE_RACE_STOP = 'CREATE_RACE_STOP';
export const DELETE_RACE_STOP = 'DELETE_RACE_STOP';
export const CREATE_RACE_STINT = 'CREATE_RACE_STINT';
export const DELETE_RACE_STINT = 'DELETE_RACE_STINT';
export const DELETE_RACE = 'DELETE_RACE';

export const REFRESH_RACEHERO_STARTED = 'REFRESH_RACEHERO_STARTED';
export const REFRESH_RACEHERO_SUCCESS = 'REFRESH_RACEHERO_SUCCESS';
export const REFRESH_RACEHERO_ERROR = 'REFRESH_RACEHERO_ERROR';

export const CONNECT_RACEHERO_SOCKET_STARTED = 'CONNECT_RACEHERO_SOCKET_STARTED';
export const CONNECT_RACEHERO_SOCKET_SUCCESS = 'CONNECT_RACEHERO_SOCKET_SUCCESS';
export const CONNECT_RACEHERO_SOCKET_ERROR = 'CONNECT_RACEHERO_SOCKET_ERROR';
export const DISCONNECT_RACEHERO_SOCKET = 'DISCONNECT_RACEHERO_SOCKET';
export const RACEHERO_SOCKET_PUSH = 'RACEHERO_SOCKET_PUSH';

export function createDriver(values) {
  return {
    type: CREATE_DRIVER,
    payload: values
  };
}

export function deleteDriver(id) {
  return {
    type: DELETE_DRIVER,
    payload: id
  };
}

export function createCar(values) {
  return {
    type: CREATE_CAR,
    payload: values
  };
}

export function deleteCar(id) {
  return {
    type: DELETE_CAR,
    payload: id
  };
}

export function createRace(values) {
  // if the post already exists, should return it here,
  // no need to make an AJAX request.  Unless it is stale!
  //const request = axios.post(`${ROOT_URL}/posts${API_KEY}`, values)
  // .then(() => callback());

  return {
    type: CREATE_RACE,
    payload: values
  };
}

export function createStopId(race) {
  const stops = _.toArray(race.stops)
    .sort((a, b) => a.id - b.id);
  if (_.isEmpty(stops)) {
    return 1;
  }

  const maxStop = stops.slice(-1)[0];
  return maxStop.id + 1;
}

export function createRaceStop(raceId, values) {
  return {
    type: CREATE_RACE_STOP,
    payload: { raceId, values }
  };
}

export function deleteRaceStop(raceId, stopId) {
  return {
    type: DELETE_RACE_STOP,
    payload: { raceId, stopId }
  };
}

export function createStintId(race) {
  const stints = _.toArray(race.stints)
    .sort((a, b) => a.id - b.id);
  if (_.isEmpty(stints)) {
    return 1;
  }

  const maxStint = stints.slice(-1)[0];
  return maxStint.id + 1;
}

export function createRaceStint(raceId, values) {
  return {
    type: CREATE_RACE_STINT,
    payload: { raceId, values }
  };
}

export function deleteRaceStint(raceId, stintId) {
  return {
    type: DELETE_RACE_STINT,
    payload: { raceId, stintId }
  };
}
export function deleteRace(id) {
  return {
    type: DELETE_RACE,
    payload: id
  };
}

const pingInterval = {};
const ws = {};

export function disconnectRaceHeroSocket(race) {
  if (pingInterval[race.id]) {
    clearInterval(pingInterval[race.id]);
  }
  if (ws[race.id]) {
    ws[race.id].close();
  }
  return {
    type: DISCONNECT_RACEHERO_SOCKET,
    payload: { raceId: race.id }
  }
}

function normalizeRaceHeroRaceName(str) {
  return str
    .toLowerCase()
    .replace(/ /g,'-')
    .replace(/[^\w-]+/g,'');

  // this alternative would avoid double/triple consecutive dashes
  /*
  return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
   */
}

export function connectRaceHeroSocket(race) {
  let origin = window.location.protocol + '//' + window.location.host;
  const urlPrefix = 'https://cors-anywhere.herokuapp.com/http://racehero.io';

  if (!race.raceHeroName) {
    return {
      type: CONNECT_RACEHERO_SOCKET_ERROR,
      payload: { raceId: race.id, error: 'No race hero race name is set for this race.' }
    };
  }

  return (dispatch, getState) => {
    dispatch({ type: CONNECT_RACEHERO_SOCKET_STARTED });
    console.log('dispatched CONNECT_RACEHERO_SOCKET_STARTED');

    fetch(urlPrefix + '/events/' + normalizeRaceHeroRaceName(race.raceHeroName),
      { headers: { origin }})
    .then(response => response.text())
    .then(data => {
      let re = /push_service_token: '(\S+)?'/gm;
      let match = re.exec(data);
      if (!match) {
        // this is when the race isn't currently running (finished)      
        re = /new PusherService\("(\S+)?"\)/gm;
        match = re.exec(data);
        if (!match) {
          throw new Error('No Pusher application ID found');
        }
      }

      const pusherAppId = match[1];

      re = /push_service_channel: '(\S+)?'/gm;
      match = re.exec(data);
      if (!match) {
        re = /push_service\.subscribe\("(\S_)?"\)/gm;
        match = re.exec(data);
        if (!match) {
          throw new Error('No Pusher event ID found');
        }
      }

      const channel = match[1];

      ws[race.id] = new Sockette('ws://ws.pusherapp.com/app/' + pusherAppId + '?protocol=7&client=js&version=2.2.4&flash=false', {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: e => { 
          console.log('Sockette Connected!', e);  
        },
        onmessage: e => {
          console.log('Sockette Received:', e);

          const data = JSON.parse(e.data);
          //console.log('got message data', data);
          if (data.event && data.event === 'pusher:connection_established') {
            const message = JSON.stringify({
              event: 'pusher:subscribe',
              data: {
               channel
              }
            });
            ws[race.id].send(message);
            return;
          }

          if (data.event && data.event === 'pusher_internal:subscription_succeeded') {
            dispatch({ type: CONNECT_RACEHERO_SOCKET_SUCCESS, payload: { raceId: race.id, channel }});
            pingInterval[race.id] = setInterval(() => {
              ws[race.id].send(JSON.stringify({
                event: 'pusher:ping',
                data: {}
              }));
            }, 119e3);
            return;
          }

          console.log('got pusher data:',data);

          if (data.event && data.event == 'payload') {
            dispatch({ type: RACEHERO_SOCKET_PUSH, payload: { raceId: race.id, data: JSON.parse(data.data).payload }});
          } else if (data.event) {
            console.log('unknown pusher event:',data);
          }
        },
        onreconnect: e => console.log('Sockette Reconnecting...', e),
        onmaximum: e => console.log('Sockette Stop Attempting!', e),
        onclose: e => { console.log('Sockette Closed!', e); if (pingInterval[race.id]) { clearInterval(pingInterval[race.id]); } },
        onerror: e => { console.log('Sockette Error:', e); ws[race.id].close(); }
      });
    })
    .catch(error => {
      dispatch({ type: CONNECT_RACEHERO_SOCKET_ERROR, payload: { raceId: race.id, error: error}});
      console.log('dispatched CONNECT_RACEHERO_SOCKET_ERROR');
      if (ws[race.id]) {
        ws[race.id].close();
      }
    });
  };  
}

export function refreshRaceHero(race) {
  if (!race.raceHeroName) {
    return {
      type: REFRESH_RACEHERO_ERROR,
      payload: { raceId: race.id, error: 'No race hero race name is set for this race. '}
    };
  }

  let origin = window.location.protocol + '//' + window.location.host;
  const urlPrefix = 'https://cors-anywhere.herokuapp.com/http://racehero.io';

  return (dispatch, getState) => {
    dispatch({ type: REFRESH_RACEHERO_STARTED });
    console.log('dispatched REFRESH_RACEHERO_STARTED');

    const raceHeroRaceName = normalizeRaceHeroRaceName(race.raceHeroName);

    fetch(urlPrefix + '/events/' + raceHeroRaceName,
      { headers: { origin }})
    .then(response => response.text())
    .then(data => {
      let re = /json_path_for_run:\s+'(\S+)?'/;
      let match = data.match(re);
      if (match) {
        const url = urlPrefix + match[1];
        return url;
      }
      throw new Error('No URL was found for race data');
    })
    .then(url => {
      fetch(url, { headers: { origin }})
      .then(response => response.json())
      .then(data => {
        dispatch({ type: REFRESH_RACEHERO_SUCCESS, payload: { raceId: race.id, data }});
        console.log('dispatched REFRESH_RACEHERO_SUCCESS');
      });
    })
    .catch(error => {
      dispatch({ type: REFRESH_RACEHERO_ERROR, payload: { raceId: race.id, error: error}});
      console.log('dispatched REFRESH_RACEHERO_ERROR');      
    });
  };
}