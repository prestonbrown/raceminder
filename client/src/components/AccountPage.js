import React from 'react';

import { PasswordForgetForm } from './PasswordForget';
import PasswordChangeForm from './PasswordChangeForm';

const AccountPage = ({ authUser }) =>
    <div>
      <h1>Account: {authUser.email}</h1>
      <PasswordForgetForm />
      <PasswordChangeForm />
    </div>

export default AccountPage;
