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
     <Jumbotron>
        <Container>
          <Row>
            <Col>
              <h1>Welcome to RaceMinder!</h1>
              <div className="btn-toolbar">
                <Link to="/races/create" className="btn btn-primary">New Race</Link>
                <Link to="/races/" className="btn btn-secondary">Existing Races</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </Jumbotron>      
      );
  }
}