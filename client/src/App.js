/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import 'dseg/css/dseg.css';
import './App.css';

import { BrowserRouter, Switch } from 'react-router-dom';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';

import firebase from './firebase';

import * as routes from './routes';

import Route from './components/AuthRoute';

import RMNav from './components/RMNav';

import SignInPage from './components/SignIn';
import AccountPage from './components/AccountPage';

import DriversCreate from './components/DriversCreate';
import DriversIndex from './components/DriversIndex';

import CarsCreate from './components/CarsCreate';
import CarsIndex from './components/CarsIndex';

import RacesCreate from './components/RacesCreate';
import RacesManage from './components/RacesManage';
import RacesIndex from './components/RacesIndex';
import TrackModal from './components/TrackModal';

import Dashboard from './components/Dashboard';

import { fetchDrivers, fetchCars, fetchTracks, fetchRaces, createTrack } from './actions';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      authUser: null
    };
  }

  componentDidMount() {
    const auth = firebase.auth();

    this.props.fetchCars();
    this.props.fetchTracks();
    this.props.fetchDrivers();
    this.props.fetchRaces();

    //this.callApi();

    auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState(() => ({ authUser }))
        : this.setState(() => ({ authUser: null }));
    });
  }

  callApi() {
    fetch('/api/ping')
    .then(response => {
      response.json()
      .then(function(data) {
        console.log('got API response:',data);
      });
    })
    .catch(err => {
      console.log('fetch() error:',err);
    });
  }

  render() {
    const { tracks } = this.props;

    if (!tracks) {
      return null;
    }
    return (
        <BrowserRouter>
          <div>
            <RMNav authUser={this.state.authUser} />
            <Container fluid>
              <Switch>
                <Route exact path={routes.SIGN_IN} isPublic={true} component={() => <SignInPage />} />
                <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />

                <Route path={`${routes.DRIVERS}/create`} component={DriversCreate} />
                <Route path={`${routes.DRIVERS}/:id`} render={() => <DriversCreate />} />
                <Route path={`${routes.DRIVERS}/`} component={DriversIndex} />

                <Route path={`${routes.CARS}/create`} component={CarsCreate} />
                <Route path={`${routes.CARS}/:id`} component={CarsCreate} />
                <Route path={`${routes.CARS}/`} component={CarsIndex} />              


                <Route path={`${routes.TRACKS}/:id`} render={({ match }) => <TrackModal isOpen={true} onClose={() => null} handleSubmit={values => this.props.createTrack(values)} track={tracks[match.params.id]} />} />
                <Route path={`${routes.RACES}/create`} render={() => <RacesCreate />} />
                <Route path={`${routes.RACES}/manage/:id`} component={RacesManage} />
                <Route path={`${routes.RACES}/:id`} component={RacesCreate} />
                <Route path={`${routes.RACES}/`} component={RacesIndex} />
                <Route path={`${routes.HOME}`} render={() => <Dashboard authUser={this.state.authUser} />} />
             </Switch>
            </Container>
          </div>
        </BrowserRouter>
    );
  }
}

export default connect(({ tracks }) => ({ tracks }), { fetchCars, fetchTracks, fetchDrivers, fetchRaces, createTrack })(App);
