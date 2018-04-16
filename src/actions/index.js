/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

export const SELECT_DRIVER = 'SELECT_DRIVER';

export const CREATE_RACE = 'CREATE_RACE';
export const DELETE_RACE = 'DELETE_RACE';

export const CREATE_CAR = 'CREATE_CAR';

export function selectDriver(id) {
  return {
    type: SELECT_DRIVER,
    payload: id
  }
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

export function deleteRace(id) {
  return {
    type: DELETE_RACE,
    payload: id
  }
}

export function createCar(values) {
  return {
    type: CREATE_CAR,
    payload: values
  }
}