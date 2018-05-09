/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import 'dseg/css/dseg.css';
import './App.css';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import React, { Component } from 'react';
import { Container } from 'reactstrap';

import * as routes from './routes';

import RMNav from './components/RMNav';

import SignInPage from './components/SignInPage';
import AccountPage from './components/AccountPage';

import DriversCreate from './components/DriversCreate';
import DriversIndex from './components/DriversIndex';

import CarsCreate from './components/CarsCreate';
import CarsIndex from './components/CarsIndex';

import RacesCreate from './components/RacesCreate';
import RacesManage from './components/RacesManage';
import RacesIndex from './components/RacesIndex';

import Dashboard from './components/Dashboard';

class App extends Component {
  componentDidMount() {
    this.callApi();
  }

  callApi() {
    fetch('/api/ping')
    .then(response => {
      response.json()
      .then(function(data) {
        console.log('got API response:',data);
      })
    })
    .catch(err => {
      console.log('fetch() error:',err);
    });
  }

  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <RMNav />
            <Container fluid>
              <Switch>
                <Route exact path={routes.SIGN_IN} component={() => <SignInPage />} />
                <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />

                <Route path={`${routes.DRIVERS}/create`} component={DriversCreate} />
                <Route path={`${routes.DRIVERS}/:id`} render={() => <DriversCreate />} />
                <Route path={`${routes.DRIVERS}/drivers/`} component={DriversIndex} />

                <Route path={`${routes.CARS}/create`} component={CarsCreate} />
                <Route path={`${routes.CARS}/:id`} component={CarsCreate} />
                <Route path={`${routes.CARS}/`} component={CarsIndex} />              

                {/*<Route path={`${routes.RACES}/create`} render={() => <RacesCreate handleSubmit={values => console.log(values)} />} />*/}
                <Route path={`${routes.RACES}/create`} render={() => <RacesCreate />} />
                <Route path={`${routes.RACES}/manage/:id`} component={RacesManage} />
                <Route path={`${routes.RACES}/:id`} component={RacesCreate} />
                <Route path={`${routes.RACES}/`} component={RacesIndex} />
                <Route path={`${routes.HOME}`} component={Dashboard} />
             </Switch>
            </Container>
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;