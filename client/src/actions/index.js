/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import Sockette from 'sockette';
import firebase from '../firebase';

export const FETCH_DRIVERS = 'FETCH_DRIVERS';
export const CREATE_DRIVER = 'CREATE_DRIVER';
export const DELETE_DRIVER = 'DELETE_DRIVER';

export const FETCH_CARS = 'FETCH_CARS';
export const CREATE_CAR = 'CREATE_CAR';
export const DELETE_CAR = 'DELETE_CAR';

export const FETCH_RACES = 'FETCH_RACES';
export const CREATE_RACE = 'CREATE_RACE';
export const CREATE_RACE_STOP = 'CREATE_RACE_STOP';
export const DELETE_RACE_STOP = 'DELETE_RACE_STOP';
export const CREATE_RACE_STINT = 'CREATE_RACE_STINT';
export const DELETE_RACE_STINT = 'DELETE_RACE_STINT';
export const DELETE_RACE = 'DELETE_RACE';
export const SET_SELECTED_STOP = 'SET_SELECTED_STOP';
export const SET_SELECTED_STINT = 'SET_SELECTED_STINT';

export const CONNECT_RACEMONITOR_SOCKET_STARTED = 'CONNECT_RACEMONITOR_SOCKET_STARTED';
export const CONNECT_RACEMONITOR_SOCKET_SUCCESS = 'CONNECT_RACEMONITOR_SOCKET_SUCCESS';
export const CONNECT_RACEMONITOR_SOCKET_ERROR = 'CONNECT_RACEMONITOR_SOCKET_ERROR';
export const DISCONNECT_RACEMONITOR_SOCKET = 'DISCONNECT_RACEMONITOR_SOCKET';
export const RACEMONITOR_SOCKET_PUSH = 'RACEMONITOR_SOCKET_PUSH';

export const REFRESH_RACEHERO_STARTED = 'REFRESH_RACEHERO_STARTED';
export const REFRESH_RACEHERO_SUCCESS = 'REFRESH_RACEHERO_SUCCESS';
export const REFRESH_RACEHERO_ERROR = 'REFRESH_RACEHERO_ERROR';

export const CONNECT_RACEHERO_SOCKET_STARTED = 'CONNECT_RACEHERO_SOCKET_STARTED';
export const CONNECT_RACEHERO_SOCKET_SUCCESS = 'CONNECT_RACEHERO_SOCKET_SUCCESS';
export const CONNECT_RACEHERO_SOCKET_ERROR = 'CONNECT_RACEHERO_SOCKET_ERROR';
export const DISCONNECT_RACEHERO_SOCKET = 'DISCONNECT_RACEHERO_SOCKET';
export const RACEHERO_SOCKET_PUSH = 'RACEHERO_SOCKET_PUSH';
export const FETCH_RACEHERO_LAP_DATA = 'RACEHERO_LAP_DATA';
export const CLEAR_RACEHERO_DATA = 'CLEAR_RACEHERO_DATA';

export const CONNECT_PODIUM_SOCKET_STARTED = 'CONNECT_PODIUM_SOCKET_STARTED';
export const CONNECT_PODIUM_SOCKET_SUCCESS = 'CONNECT_PODIUM_SOCKET_SUCCESS';
export const CONNECT_PODIUM_SOCKET_ERROR = 'CONNECT_PODIUM_SOCKET_ERROR';
export const DISCONNECT_PODIUM_SOCKET = 'DISCONNECT_PODIUM_SOCKET';
export const PODIUM_SOCKET_PUSH = 'PODIUM_SOCKET_PUSH';

export const FETCH_TRACKS = 'FETCH_TRACKS';
export const CREATE_TRACK = 'CREATE_TRACK';
export const DELETE_TRACK = 'DELETE_TRACK';

const tracksDbRef = firebase.database().ref().child('tracks');
const racesDbRef = firebase.database().ref().child('races');
const driversDbRef = firebase.database().ref().child('drivers');
const carsDbRef = firebase.database().ref().child('cars');

//export const createTrack = newTrack => async dispatch => { console.log('in createTrack, values:',newTrack); return tracksRef.push(newTrack); }

export function createTrack(values) {
  return dispatch => {
    const id = values.id || tracksDbRef.push().key;
    values.id = id;
    tracksDbRef.child(id).set(values);
    dispatch({
      type: CREATE_TRACK,
      payload: values
    });
  };
}

export function deleteTrack(id) {
  return dispatch => {
    tracksDbRef.child(id).remove();
    dispatch({
      type: DELETE_TRACK,
      payload: id
    });
  };
}

export function fetchTracks() {
  return dispatch => {
    tracksDbRef.once('value', snapshot => {
      dispatch({
        type: FETCH_TRACKS,
        payload: snapshot.val()
      });
    });
  };
}

export function fetchDrivers() {
  return dispatch => {
    driversDbRef.once('value', snapshot => {
      dispatch({
        type: FETCH_DRIVERS,
        payload: snapshot.val()
      });
    });
  };
}
export function createDriver(values) {
  return dispatch => {
    const id = values.id || driversDbRef.push().key;
    values.id = id;
    driversDbRef.child(id).set(values);
    dispatch({
      type: CREATE_DRIVER,
      payload: values
    });
  };
}

export function deleteDriver(id) {
  return dispatch => {
    driversDbRef.child(id).remove();
    dispatch({
      type: DELETE_DRIVER,
      payload: id
    });
  };
}

export function fetchCars() {
  return dispatch => {
    carsDbRef.once('value', snapshot => {
      dispatch({
        type: FETCH_CARS,
        payload: snapshot.val()
      });
    });
  };
}

export function createCar(values) {
  return dispatch => {
    const id = values.id || carsDbRef.push().key;
    values.id = id;
    carsDbRef.child(id).set(values);
    dispatch({
      type: CREATE_CAR,
      payload: values
    });
  };
}

export function deleteCar(id) {
  return dispatch => {
    carsDbRef.child(id).remove();
    dispatch({
      type: DELETE_CAR,
      payload: id
    });
  };
}

export function fetchRaces() {
  return dispatch => {
    racesDbRef.once('value', snapshot => {
      dispatch({
        type: FETCH_RACES,
        payload: snapshot.val()
      });
    });
  };
}

export function createRace(values) {
  return dispatch => {
    const id = values.id || racesDbRef.push().key;
    values.id = id;
    racesDbRef.child(id).set(values);
    dispatch({
      type: CREATE_RACE,
      payload: values
    });
  };
}

/*
export function createStopId(race) {
  const stops = _.toArray(race.stops)
    .sort((a, b) => a.id - b.id);
  if (_.isEmpty(stops)) {
    return 1;
  }

  const maxStop = stops.slice(-1)[0];
  return maxStop.id + 1;
}
*/

export function createRaceStop(raceId, carId, values) {
  return dispatch => {
    const id = values.id || racesDbRef.child(`${raceId}/stops/${carId}`).push().key;
    values.id = id;
    racesDbRef.child(`${raceId}/stops/${carId}/${id}`).set(values);
    dispatch({
      type: CREATE_RACE_STOP,
      payload: { raceId, carId, values }
    });
  };
}

export function deleteRaceStop(raceId, carId, stopId) {
  return dispatch => {
    racesDbRef.child(`${raceId}/stops/${carId}/${stopId}`).remove();
    dispatch({
      type: DELETE_RACE_STOP,
      payload: { raceId, carId, stopId }
    });
  };
}

export function setSelectedStop(raceId, carId, stopId) {
  return {
    type: SET_SELECTED_STOP,
    payload: { raceId, carId, stopId }
  };
}

export function setSelectedStint(raceId, carId, stintId) {
  return {
    type: SET_SELECTED_STINT,
    payload: { raceId, carId, stintId }
  };
}

/*
export function createStintId(race) {
  const stints = _.toArray(race.stints)
    .sort((a, b) => a.id - b.id);
  if (_.isEmpty(stints)) {
    return 1;
  }

  const maxStint = stints.slice(-1)[0];
  return maxStint.id + 1;
}
*/

export function createRaceStint(raceId, carId, values) {
  return dispatch => {
    const id = values.id || racesDbRef.child(`${raceId}/stints/${carId}`).push().key;
    values.id = id;
    racesDbRef.child(`${raceId}/stints/${carId}/${id}`).set(values);
    dispatch({
      type: CREATE_RACE_STINT,
      payload: { raceId, carId, values }
    });
  };
}

export function deleteRaceStint(raceId, carId, stintId) {
  return dispatch => {
    racesDbRef.child(`${raceId}/stints/${carId}/${stintId}`).remove();
    dispatch({
      type: DELETE_RACE_STINT,
      payload: { raceId, carId, stintId }
    });
  };
}

export function deleteRace(id) {
  return dispatch => {
    racesDbRef.child(id).remove();
    dispatch({
      type: DELETE_RACE,
      payload: id
    });
  };
}

const rmws = {};

export function disconnectRaceMonitorSocket(race) { 
  if (rmws[race.id]) {
    rmws[race.id].close();
    delete rmws[race.id];
  }
  return {
    type: DISCONNECT_RACEMONITOR_SOCKET,
    payload: { raceId: race.id }
  };
}

export function connectRaceMonitorSocket(race) {
  let origin = window.location.protocol + '//' + window.location.host;
  const urlPrefix = 'https://cors-anywhere.herokuapp.com/https://apicdn.race-monitor.com/Info/WebRaceList?raceID=';

  if (!race.raceMonitorId) {
    return {
      type: CONNECT_RACEMONITOR_SOCKET_ERROR,
      payload: { raceId: race.id, error: 'No Race Monitor race ID has been set' }
    };
  }

/*
  const carRef = carsDbRef.child(race.car);
  const getCar = async () => {
    const snapshot = await carRef.once('value');
    return snapshot.val();
  };
  const car = getCar();
*/
  return (dispatch, getState) => {
    dispatch({ type: CONNECT_RACEMONITOR_SOCKET_STARTED });
    console.log('dispatched CONNECT_RACEMONITOR_SOCKET_STARTED');

    fetch(urlPrefix + race.raceMonitorId,
      { headers: { origin }})
    .then(response => response.json())
    .then(data => {
      if (!data.CurrentRaces.length) {
        throw new Error('No current race was found with the given Race Monitor race ID');
      }

      // data should be in this format:
      // {
      //   "Restrictions": "",
      //   "CurrentRaces": [
      //     {
      //       "ID": 37872,
      //       "ReceivingData": true,
      //       "IPAddress": "50.56.75.58",
      //       "Instance": "209"
      //     }
      //   ],
      //   "Style": null,
      //   "LiveTimingToken": "094f6abe-27e5-4a95-bbfc-5944785d3c99"
      // }
      const raceInfo = data.CurrentRaces.shift();

      rmws[race.id] = new Sockette('ws://' + raceInfo.IPAddress, {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: e => { 
          console.log('Race Monitor Sockette Connected!', e);

          dispatch({
            type: CONNECT_RACEMONITOR_SOCKET_SUCCESS,
            payload: { raceId: race.id, instance: raceInfo.Instance, token: data.LiveTimingToken }
          });

          // send join message
          const message = '$JOIN,' + raceInfo.Instance + ',' + data.LiveTimingToken;
          rmws[race.id].send(message);
        },
        onmessage: e => {
          //console.log('Race Monitor Sockette Received:', e);

          const data = e.data;
          // we are only interested in a subset of all the data that race monitor can provide
          // seems that $RMHL ones are the most useful, and for our car number
          if (data.includes('$RMHL')) {
            dispatch({
              type: RACEMONITOR_SOCKET_PUSH,
              payload: { raceId: race.id, data: data }
            });
          }
        },
        onreconnect: e => console.log('Race Monitor Sockette Reconnecting...', e),
        onmaximum: e => console.log('Race Monitor Sockette Stop Attempting!', e),
        onclose: e => { console.log('Race Monitor Sockette Closed!', e); if (rhPingInterval[race.id]) { clearInterval(rhPingInterval[race.id]); } },
        onerror: e => { console.log('Race Monitor Sockette Error:', e); rhws[race.id].close(); }
      });
    })
    .catch(error => {
      dispatch({ type: CONNECT_RACEMONITOR_SOCKET_ERROR, payload: { raceId: race.id, error: error}});
      console.log('dispatched CONNECT_RACEMONITOR_SOCKET_ERROR');
      if (rhws[race.id]) {
        rhws[race.id].close();
      }
    });
  };

}

const rhPingInterval = {};
const rhws = {};

export function disconnectRaceHeroSocket(race) {
  if (rhPingInterval[race.id]) {
    clearInterval(rhPingInterval[race.id]);
  }
  if (rhws[race.id]) {
    rhws[race.id].close();
    delete rhws[race.id];
  }
  return {
    type: DISCONNECT_RACEHERO_SOCKET,
    payload: { raceId: race.id }
  };
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
  if (rhws[race.id]) {
    return {
      type: CONNECT_RACEHERO_SOCKET_ERROR,
      payload: { raceId: race.id, error: 'Socket already connected for this race.' }
    };
  }

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

      rhws[race.id] = new Sockette('ws://ws.pusherapp.com/app/' + pusherAppId + '?protocol=7&client=js&version=2.2.4&flash=false', {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: e => { 
          console.log('Sockette Connected!', e);  
        },
        onmessage: e => {
          //console.log('Sockette Received:', e);

          const data = JSON.parse(e.data);
          //console.log('got message data', data);
          if (data.event && data.event === 'pusher:connection_established') {
            const message = JSON.stringify({
              event: 'pusher:subscribe',
              data: {
               channel
              }
            });
            rhws[race.id].send(message);
            return;
          }

          if (data.event && data.event === 'pusher_internal:subscription_succeeded') {
            dispatch({ type: CONNECT_RACEHERO_SOCKET_SUCCESS, payload: { raceId: race.id, channel }});
            rhPingInterval[race.id] = setInterval(() => {
              rhws[race.id].send(JSON.stringify({
                event: 'pusher:ping',
                data: {}
              }));
            }, 119e3);
            return;
          }

          if (data.event && data.event === 'payload') {
            dispatch({ type: RACEHERO_SOCKET_PUSH, payload: { raceId: race.id, data: JSON.parse(data.data).payload }});
          } else if (data.event && data.event === 'pusher:pong') {
            ; // ignore it
          } else if (data.event) {
            console.log('unknown pusher event:',data);
          }
        },
        onreconnect: e => console.log('Sockette Reconnecting...', e),
        onmaximum: e => console.log('Sockette Stop Attempting!', e),
        onclose: e => { console.log('Sockette Closed!', e); if (rhPingInterval[race.id]) { clearInterval(rhPingInterval[race.id]); } },
        onerror: e => { console.log('Sockette Error:', e); rhws[race.id].close(); }
      });
    })
    .catch(error => {
      dispatch({ type: CONNECT_RACEHERO_SOCKET_ERROR, payload: { raceId: race.id, error: error}});
      console.log('dispatched CONNECT_RACEHERO_SOCKET_ERROR');
      if (rhws[race.id]) {
        rhws[race.id].close();
      }
    });
  };  
}

export function fetchRaceHeroLapData(race, racerId) {
  let origin = window.location.protocol + '//' + window.location.host;
  const urlPrefix = 'https://cors-anywhere.herokuapp.com/http://racehero.io';

  if (!race.raceHeroName) {
    return {
      type: CONNECT_RACEHERO_SOCKET_ERROR,
      payload: { raceId: race.id, error: 'No race hero race name is set for this race.' }
    };
  }

  return (dispatch, getState) => {
    fetch(urlPrefix + '/events/' + normalizeRaceHeroRaceName(race.raceHeroName),
      { headers: { origin }})
    .then(response => response.text())
    .then(data => {
      let re = /json_base_for_racer: '(\S+)?'/gm;
      let match = re.exec(data);
      if (!match) {
        // this is when the race isn't currently running (finished)      
        re = /new PusherService\("(\S+)?"\)/gm;
        match = re.exec(data);
        if (!match) {
          throw new Error('No Pusher application ID found in data:',data);
        }
      } else {
        let path = match[1];
        fetch(urlPrefix + path + racerId + '.json',
          { headers: { origin }})
        .then(response => response.json())
        .then(data => {
          dispatch({
            type: FETCH_RACEHERO_LAP_DATA,
            payload: { raceId: race.id, racerId: racerId, data: data.laps_data }
          });
        });
      }
    });
  };
}

export function clearRaceHeroData(race) {
    return {
      type: CLEAR_RACEHERO_DATA,
      payload: { raceId: race.id }
    };
}

const podiumPingInterval = {};
const pws = {};

export function disconnectPodiumSocket(race) {
  if (podiumPingInterval[race.id]) {
    clearInterval(podiumPingInterval[race.id]);
  }
  if (pws[race.id]) {
    pws[race.id].close();
    delete pws[race.id];
  }
  return {
    type: DISCONNECT_PODIUM_SOCKET,
    payload: { raceId: race.id }
  };
}

export function connectPodiumSocket(race) {
  if (pws[race.id]) {
    return {
      type: CONNECT_PODIUM_SOCKET_ERROR,
      payload: { raceId: race.id, error: 'Socket already connected for this race.' }
    };
  }

  let origin = window.location.protocol + '//' + window.location.host;
  const urlPrefix = 'https://cors-anywhere.herokuapp.com/http://podium.live';

  if (!race.podiumEventId) {
    return {
      type: CONNECT_PODIUM_SOCKET_ERROR,
      payload: { raceId: race.id, error: 'No podium event ID set for this race.' }
    };
  }

  return (dispatch, getState) => {
    dispatch({ type: CONNECT_PODIUM_SOCKET_STARTED });
    console.log('dispatched CONNECT_PODIUM_SOCKET_STARTED');

    fetch(urlPrefix + '/events/' + race.podiumEventId,
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

      rhws[race.id] = new Sockette('ws://ws.pusherapp.com/app/' + pusherAppId + '?protocol=7&client=js&version=2.2.4&flash=false', {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: e => { 
          console.log('Sockette Connected!', e);  
        },
        onmessage: e => {
          //console.log('Sockette Received:', e);

          const data = JSON.parse(e.data);
          //console.log('got message data', data);
          if (data.event && data.event === 'pusher:connection_established') {
            const message = JSON.stringify({
              event: 'pusher:subscribe',
              data: {
               channel
              }
            });
            rhws[race.id].send(message);
            return;
          }

          if (data.event && data.event === 'pusher_internal:subscription_succeeded') {
            dispatch({ type: CONNECT_RACEHERO_SOCKET_SUCCESS, payload: { raceId: race.id, channel }});
            rhPingInterval[race.id] = setInterval(() => {
              rhws[race.id].send(JSON.stringify({
                event: 'pusher:ping',
                data: {}
              }));
            }, 119e3);
            return;
          }

          if (data.event && data.event === 'payload') {
            dispatch({ type: RACEHERO_SOCKET_PUSH, payload: { raceId: race.id, data: JSON.parse(data.data).payload }});
          } else if (data.event && data.event === 'pusher:pong') {
            ; // ignore it
          } else if (data.event) {
            console.log('unknown pusher event:',data);
          }
        },
        onreconnect: e => console.log('Sockette Reconnecting...', e),
        onmaximum: e => console.log('Sockette Stop Attempting!', e),
        onclose: e => { console.log('Sockette Closed!', e); if (rhPingInterval[race.id]) { clearInterval(rhPingInterval[race.id]); } },
        onerror: e => { console.log('Sockette Error:', e); rhws[race.id].close(); }
      });
    })
    .catch(error => {
      dispatch({ type: CONNECT_RACEHERO_SOCKET_ERROR, payload: { raceId: race.id, error: error}});
      console.log('dispatched CONNECT_RACEHERO_SOCKET_ERROR');
      if (rhws[race.id]) {
        rhws[race.id].close();
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