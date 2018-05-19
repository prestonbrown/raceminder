import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

import firebase from '../firebase';

import * as routes from '../routes';

//Mock of an Auth method, can be replaced with an async call to the backend. Must return true or false
const isAuthenticated = () => firebase.auth().currentUser;

const AuthRoute = ({component, ...props}) => {
  const { isPublic } = props;
  if (isAuthenticated()) {
    // User is Authenticated
    return <Route { ...props } component={ component } />;
  } else {
      // If the route is public, allow access
      if (true) {
        return <Route { ...props } component={ component } />;
      } else {
        return <Redirect to={ { pathname: routes.SIGN_IN, state: { from: props.location } }} />;
    }
  }
};

AuthRoute.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func
  ])
};

export default AuthRoute;
