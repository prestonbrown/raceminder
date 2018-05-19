import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Label } from 'reactstrap';

import { SignUpLink } from './SignUp';
import { auth } from '../firebase';
import * as routes from '../routes';

import logo from '../images/race minder logo.png';

import '../styles/signin.css';

const SignInPage = ({ history }) =>
  <div className="sign-in">
    <SignInForm history={history} />
    {/*<SignUpLink />*/}
  </div>

const byPropKey = (propertyName, value) => () => ({
  [propertyName]: value,
});

const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

class SignInForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const {
      email,
      password,
    } = this.state;

    const {
      history,
    } = this.props;

    auth.doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState(() => ({ ...INITIAL_STATE }));
        history.push(routes.HOME);
      })
      .catch(error => {
        this.setState(byPropKey('error', error));
      });

    event.preventDefault();
  }

  render() {
    const {
      email,
      password,
      error,
    } = this.state;

    const isInvalid =
      password === '' ||
      email === '';

    return (
      <form className="form-sign-in" onSubmit={this.onSubmit}>
        <div className="text-center">
        <img className="mb-4" src={logo} alt="raceminder" width="72" />
        <h1 className="h3 mb-3 font-weight-normal text-light">Please sign in</h1>

        <Label for="inputEmail" className="sr-only">Email Address</Label>
        <input
          id="inputEmail"
          className="form-control"
          value={email}
          onChange={event => this.setState(byPropKey('email', event.target.value))}
          type="email"
          placeholder="Email Address"
          required
          autoFocus
        />

        <Label for="inputPassword" className="sr-only">Password</Label>
        <input
          id="inputPassword"
          className="form-control"
          value={password}
          onChange={event => this.setState(byPropKey('password', event.target.value))}
          type="password"
          placeholder="Password"
          required
        />

        <button
          disabled={isInvalid} 
          className="btn btn-lg btn-primary btn-block"
          type="submit">
          Sign in
        </button>

        { error && <p>{error.message}</p> }

        <p className="mt-5 mb-3 text-muted small">&copy; 2018 Loose Canon Racing, LLC</p>

        </div>

      </form>
    );
  }
}

export default withRouter(SignInPage);

export {
  SignInForm
};