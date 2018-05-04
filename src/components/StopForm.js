import _ from 'lodash';

import React, { Component } from 'react';
import { Form, FormGroup, Label, Col, Row } from 'reactstrap';

import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { createRaceStop } from '../actions';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

moment.locale('en');
momentLocalizer();

class StopForm extends Component {
  componentWillMount() {
    console.log('in stopform componentwillmount, props',this.props);
    const { race, stopId, activeStintId } = this.props;
    const stop = race.stops[stopId];

    console.log('stop form got race:', race);
    console.log('stop form got stop:', stop);    
    console.log('stop form got stopId:', stopId);        
    if (stop) {
      //console.log('edit stop initial values: ', stop);
      this.props.initialize(stop);
    }
  }

  renderTireTempInputs(pos, side) {
    const label = pos + side.charAt(0).toUpperCase() + side.slice(1);
    return (
      <div>
        <Label className="form-text text-center">Temps</Label>
        <div className="form-row">
          <div className="col">
            <Field name={label + (side === 'left' ? 'Outer' : 'Inner') + 'Temp'} component="input" type="number" maxLength="2" className="form-control form-control-sm" />
          </div>
          <div className="col">
            <Field name={label + 'MiddleTemp'} component="input" type="number" maxLength="2" className="form-control form-control-sm" />
          </div>
          <div className="col">
            <Field name={label + (side === 'left' ? 'Inner' : 'Outer') + 'Temp'} component="input" type="number" maxLength="2" className="form-control form-control-sm" />
          </div>
        </div>
      </div>
      );
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
        <Row className="form-row">
          <Col xs={6} className="form-group">
            <Label>Started At</Label>
            <Field name="start" component="input" className="form-control form-control-sm" type="datetime-local" step="1" />
          </Col>

          <Col xs={6} className="form-group">
            <Label>Ended At</Label>
            <Field name="stop" component="input" className="form-control form-control-sm" type="datetime-local" step="1" />
          </Col>
        </Row>

        <Row className="form-row">
          <Col xs={4}>
            <Label>Duration: <strong>{moment(moment(this.props.stopValue).diff(moment(this.props.startValue))).format('mm:ss')}</strong></Label>
          </Col>
        </Row>

        <Row className="form-row">
          <Col xs={4} className="form-group">
            <Label>Fuel Added</Label>
          </Col>
          <Col xs={8}>
            <Field name="fuel" component="input"  type="number" className="form-control form-control-sm"/>
          </Col>
        </Row>

        <Row className="form-row">
          <Col xs={4}>
            <Label>Relieving Driver</Label>
          </Col>
          <Col xs={8}>
            <Field name="driver" component="select" className="form-control form-control-sm">
              <option key='' value=''>- Select a Driver -</option>
              {_.map(this.props.drivers, ({ id, firstname, lastname }) => <option key={id} value={id}>{firstname} {lastname}</option>)}
            </Field>
          </Col>
        </Row>

        <Row className="form-row equal">
          <Col xs={4} className="d-flex flex-column">
            
            <FormGroup>
              <Label>Front Left</Label>
              <Field name="frontLeft" component="input" type="number" className="form-control form-control-sm" />
              {this.renderTireTempInputs('front', 'left')}
            </FormGroup>

            <FormGroup className="mt-auto">
              <Label>Rear Left</Label>
              <Field name="rearLeft" component="input" type="number" className="form-control form-control-sm" />
              {this.renderTireTempInputs('rear', 'left')}
            </FormGroup>
          </Col>
  
          <Col xs={4} className="d-flex flex-column align-center pt-4">
            <img alt="Top down view of car" src="/gray-car-top-view.png" className="img-responsive" style={{width: '100%'}} />
          </Col>

          <Col xs={4} className="d-flex flex-column">
            <FormGroup>
              <Label>Front Right</Label>
              <Field name="frontRight" component="input" type="number" className="form-control form-control-sm" />
              {this.renderTireTempInputs('front', 'right')}
            </FormGroup>

            <FormGroup className="mt-auto">
              <Label>Rear Right</Label>
              <Field name="rearRight" component="input" type="number" className="form-control form-control-sm" />
              {this.renderTireTempInputs('rear', 'right')}
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label>Notes</Label>
          <Field name="notes" component="textarea" rows="3" className="form-control form-control-sm" />
        </FormGroup>
      </Form>
    );
  }
}

StopForm = reduxForm({
  form: 'StopForm'
})(StopForm);

// decorate with connect to read form values.
const selector = formValueSelector('StopForm');

function mapStateToProps(state, ownProps) {
  const drivers = state.drivers;
  const startValue = selector(state, 'start');
  const stopValue = selector(state, 'stop');

  return { 
    drivers, 
    startValue,
    stopValue
  };
}

export default connect(mapStateToProps, { createRaceStop })(StopForm);
