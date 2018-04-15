/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import React, { Component } from 'react';

import RMNav from './components/RMNav';

import DriversCreate from './components/DriversCreate';
import DriversView from './components/DriversView';
import DriversIndex from './components/DriversIndex';

import RacesCreate from './components/RacesCreate';
import RacesView from './components/RacesView';
import RacesIndex from './components/RacesIndex';

import Dashboard from './components/Dashboard';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>

        <RMNav />
        <BrowserRouter>
          <div>
            <Switch>
              <Route path="/drivers/create" component={DriversCreate} />
              <Route path="/drivers/:id" component={DriversView} />
              <Route path="/drivers/" component={DriversIndex} />

              {/*<Route path="/races/create" render={() => <RacesCreate handleSubmit={values => console.log(values)} />} />*/}
              <Route path="/races/create" render={() => <RacesCreate />} />
              <Route path="/races/:id" component={RacesView} />
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