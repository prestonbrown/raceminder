import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, Route } from 'react-router-dom';

//Mock of an Auth method, can be replaced with an async call to the backend. Must return true or false
const isAuthenticated = () => true;

const PUBLIC_ROOT = '/login';

const AuthRoute = ({component, ...props}) => {
  const { isPublic } = true;
  if (isAuthenticated()) {
    // User is Authenticated
    return <Route { ...props } component={ component } />;
  } else {
      // If the route is public, allow access
      if (isPublic) {
        return <Route { ...props } component={ component } />;
      } else {
        return <Redirect to={ PUBLIC_ROOT } />;
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
