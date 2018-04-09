/**
 * RaceMinder Copyright (c) 2018 Preston Brown & Loose Canon Racing, Inc.
 */

import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Jumbotron,
  Button,

  Input

} from 'reactstrap';

import RMNav from './components/RMNav';
import ModalExample from './components/ModalExample';
import DriverDropdown from './components/DriverDropdown';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = { 
        newRace: false, 
        races: [],
        drivers: [],
        cars: []
    };
  }

  onButtonClick(event) {
    console.log("button was clicked!");
    this.setState({ newRace: true });
  }

  render() {
    return (
      <div>

        <RMNav />

        <Jumbotron>
          <Container>
            <Row>
              <Col>
                <h1>Welcome to RaceMinder!</h1>
                <p>
                  {/*<ModalExample />*/}
                  {/*<Button
                    tag="a"
                    color="primary"
                    size="large"
                    href="/new">
                    Start New Race
                  </Button>*/}

                  <Input value={this.state.inputVal} onChange={event => this.setState({ inputVal: event.target.value })} />
                  <Button color="primary" onClick={this.onButtonClick} color="primary" size="large">Start New Race</Button>

                  <Button
                    tag="a"
                    color="success"
                    size="large"
                    href="/existing">
                    Manage Existing Race
                  </Button>

                </p>

                <DriverDropdown driverNames={this.state.drivers.map(driver => { return driver.name; })}/>
              </Col>
            </Row>
          </Container>
        </Jumbotron>
      </div>
    );
  }
}

export default App;