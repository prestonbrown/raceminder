import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Jumbotron,
  Button
} from 'reactstrap';

import RaceInfo from './components/RaceInfo';
import CarInfo from './components/CarInfo';
import RMNav from './components/RMNav';

class App extends Component {
  constructor(props) {
    super(props);
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
                  <Button
                    tag="a"
                    color="primary"
                    size="large"
                    href="/new">
                    Start New Race
                  </Button>

                  <Button
                    tag="a"
                    color="success"
                    size="large"
                    href="/existing">
                    Manage Existing Race
                  </Button>

                </p>
                <RaceInfo />

                <CarInfo />
              </Col>
            </Row>
          </Container>
        </Jumbotron>
      </div>
    );
  }
}

export default App;