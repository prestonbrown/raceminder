import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Label } from 'reactstrap';

import { SignUpLink } from './SignUp';
import { auth } from '../firebase';
import * as routes from '../routes';

import logo from '../images/race minder logo.png';

const SignInPage = ({ history }) =>
  <div style={{
    height: '100vh',
    paddingTop: '40px', 
    paddingBottom: '40px',
    marginLeft: '-15px',
    marginRight: '-15px',
    display: 'flex',
    WebkitBoxAlign: 'center',
    alignItems: 'center',
    WebkitBoxPack: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5' }}>

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
      <form className="form-signin" onSubmit={this.onSubmit} style={{ width: '100%', maxWidth: '330px', padding: '15px', margin: '0 auto' }}>
        <div className="text-center">
        <img className="mb-4" src={logo} alt="raceminder" width="72" />
        <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>

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
          style={{ marginBottom: '-1px', borderBottomLeftRadius: '0', borderBottomRightRadius: '0', position: 'relative', boxSizing: 'border-box', height: 'auto', padding: '10px', fontSize: '16px'}}
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
          style={{ marginBottom: '10px', borderTopLeftRadius: '0', borderTopRightRadius: '0', position: 'relative', boxSizing: 'border-box', height: 'auto', padding: '10px', fontSize: '16px'}}
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