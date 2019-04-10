import React, { Component } from 'react';
import {
  Container,
  Row,
  Col,
  Jumbotron,
} from 'reactstrap';

import { Link } from 'react-router-dom';

import * as routes from '../routes';

export default class Dashboard extends Component {
  render() {
    return (
     <Jumbotron className="bg-dark text-light">
        { /* <Container> */}
          <Row >
            <Col className="align-self-center">
              <h1 className="text-center">Welcome to RaceMinder!</h1>
              <Link to="/races/create" className="btn btn-primary btn-block btn-lg mr-1" tabindex={-1} role="button">New Race</Link>
              <Link to="/races/" className="btn btn-secondary btn-block btn-lg mr-1" tabindex={-1} role="button">Existing Races</Link>
            </Col>
          </Row>
        { /* </Container> */ }
      </Jumbotron>      
      );
  }
}