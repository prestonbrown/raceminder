import React from 'react';
import { DropdownItem } from 'reactstrap';

import { auth } from '../firebase';

const SignOutButton = () =>
  <button
    type="button"
    onClick={auth.doSignOut}
  >
    Sign Out
  </button>

const SignOutDropdownItem = () =>
  <DropdownItem>
    <a onClick={auth.doSignOut} role="link" tabIndex={0}>Sign Out</a>
  </DropdownItem>

export default SignOutButton;

export { SignOutDropdownItem };
