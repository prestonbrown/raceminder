import React from 'react';
import { DropdownItem } from 'reactstrap';

import { withRouter } from 'react-router-dom';

import { auth } from '../firebase';

import * as routes from '../routes';

const SignOutButton = () =>
  <button
    type="button"
    onClick={auth.doSignOut}
  >
    Sign Out
  </button>

const SignOutDropdownItem = withRouter(
  ({ history }) =>
  <DropdownItem>
    <a onClick={() => { auth.doSignOut(); history.push(routes.SIGN_IN) }} role="link" tabIndex={0}>Sign Out</a>
  </DropdownItem>
);

export default SignOutButton;

export { SignOutDropdownItem };
