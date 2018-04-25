/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import 'dseg/css/dseg.css';
import './App.css';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import React, { Component } from 'react';

import RMNav from './components/RMNav';

import DriversCreate from './components/DriversCreate';
import DriversIndex from './components/DriversIndex';

import CarsCreate from './components/CarsCreate';
import CarsIndex from './components/CarsIndex';

import RacesCreate from './components/RacesCreate';
import RacesManage from './components/RacesManage';
import RacesIndex from './components/RacesIndex';

import Dashboard from './components/Dashboard';

class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <RMNav />
            <Switch>
              <Route path="/drivers/create" component={DriversCreate} />
              <Route path="/drivers/:id" render={() => <DriversCreate />} />
              <Route path="/drivers/" component={DriversIndex} />

              <Route path="/cars/create" component={CarsCreate} />
              <Route path="/cars/:id" component={CarsCreate} />
              <Route path="/cars/" component={CarsIndex} />              

              {/*<Route path="/races/create" render={() => <RacesCreate handleSubmit={values => console.log(values)} />} />*/}
              <Route path="/races/create" render={() => <RacesCreate />} />
              <Route path="/races/manage/:id" component={RacesManage} />
              <Route path="/races/:id" component={RacesCreate} />
              <Route path="/races/" component={RacesIndex} />
              <Route path="/" component={Dashboard} />
           </Switch>
         </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;