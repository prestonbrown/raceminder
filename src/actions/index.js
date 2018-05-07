/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import _ from 'lodash';

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

export function refreshRaceHero(race) {
  let origin = window.location.protocol + '//' + window.location.host;
  const urlPrefix = 'https://cors-anywhere.herokuapp.com/http://racehero.io';

  return (dispatch, getState) => {
    dispatch({ type: REFRESH_RACEHERO_STARTED });
    console.log('dispatched REFRESH_RACEHERO_STARTED');

    fetch(urlPrefix + '/events/' + race.raceHeroName,
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