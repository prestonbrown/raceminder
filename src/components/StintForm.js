import _ from 'lodash';

import React, { Component } from 'react';
import { Form, FormGroup, Label, Row, Col } from 'reactstrap';

import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { createRaceStint } from '../actions';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

moment.locale('en');
momentLocalizer();

class StintForm extends Component {
  componentWillMount() {
    const { race, stintId } = this.props;
    const stint = race.stints[stintId];

    console.log('stint form got race:', race);
    console.log('stint form got stint:', stint);    
    console.log('stint form got stintId:', stintId);        
    
    if (stint) {
      this.props.initialize(stint);
    }
  }

  componentWillReceiveProps() {
    //const { lpg, startingLapValue } = this.props;
  }

  estimatedEndingLapByFuel() {
    if (!this.props.lpg || !this.props.startingFuelValue) {
      return 'unknown';
    }

    let startingLap = parseInt(this.props.startingLapValue, 10);
    if (!startingLap) {
      startingLap = 0;
    }
    const totalLaps = Math.floor((this.props.startingFuelValue - this.props.car.desiredFuelReserve) * this.props.lpg);
    return totalLaps + startingLap;
  }

  estimatedEndingLapByTime() {
    const { startValue, endValue, startingLapValue } = this.props;
    if (!startValue || !endValue || !this.props.startingLapValue) {
      return 'unknown';
    }

    let startingLap = parseInt(startingLapValue, 10);
    if (!startingLap) {
      startingLap = 0;
    }

    // in seconds, converted from milliseconds
    const stintLength = parseInt(moment(endValue) - moment(startValue), 10) / 1000;
    const stintLaps = Math.floor(stintLength / this.props.race.avgLapTime);
    return stintLaps;
  }

  /**
   * Disabled for now.
   */
  fixDate(value) {
    //console.log('in fixDate for value:',value);
    return value;

    if (value === null) {
      return moment().format('Y-MM-DDTHH:mm:ss');
    }
    value = value.slice(0, 19);
    console.log('value:',value);

    return value;
    /*
    let v = moment(value);
    if (!v.isValid()) {
      console.log('returning original value:',value);
      return value;
    }
    
    console.log('returning formatted value:',v.format('Y-MM-DDTHH:mm:ss'));
    return v.format('Y-MM-DDTHH:mm:ss'); 
    */
  }

  render() {
    const { handleSubmit, onSubmit, pristine, reset, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
        <Row className="form-row">
          <Col sm={6}>
            <FormGroup>
              <Label>Starts</Label>
              <Field name="start" format={this.fixDate} component="input" className="form-control form-control-sm" type="datetime-local" step="1" />
            </FormGroup>
          
            <FormGroup>
              <Row className="form-row">
                <Col className="col-6">
                  <Label>Starting Lap</Label>
                  <Field name="startingLap" component="input" type="number" parse={val => val ? parseInt(val, 10) : ''} className="form-control" step="1" />
                </Col>

                <Col className="col-6">
                  <Label>Starting Fuel</Label>
                  <Field name="startingFuel" component="input" type="number" className="form-control" />
                </Col>
              </Row>
            </FormGroup>
          </Col>

          <Col sm={6}>
            <FormGroup>
              <Label>Ends</Label>
              <Field name="end" format={this.fixDate} component="input" className="form-control form-control-sm" type="datetime-local" step="1" />
            </FormGroup>
    
            <FormGroup>
              <Label>Expected Ending Lap (by fuel: {this.estimatedEndingLapByFuel()}; by time: {this.estimatedEndingLapByTime()})</Label>
              <Field name="endingLap" component="input" type="number" parse={val => val ? parseInt(val, 10) : ''} className="form-control" step="1" />
            </FormGroup>
          </Col>
        </Row>

        <FormGroup>
          <Label>Driver</Label>
          <Field name="driver" component="select" className="form-control">
            <option key='' value=''>- Select a Driver -</option>
            {_.map(this.props.drivers, ({ id, firstname, lastname }) => <option key={id} value={id}>{firstname} {lastname}</option>)}
          </Field>
        </FormGroup>

        <FormGroup>
          <Label>Notes</Label>
          <Field name="notes" component="textarea" rows="3" className="form-control form-control-sm" />
        </FormGroup>
      </Form>
    );
  }
}

StintForm = reduxForm({
  form: 'StintForm',
})(StintForm);

// decorate with connect to read form values.
const selector = formValueSelector('StintForm');

function mapStateToProps(state, ownProps) {
  const drivers = state.drivers;
  const { race } = ownProps;
  const track = state.tracks[race.track];
  const car = state.cars[race.car];

  let lpg = null;
  if (car.mpg) {
    lpg = car.mpg / track.length;
  }

  const startValue = selector(state, 'start');
  const endValue = selector(state, 'end');
  const startingFuelValue = selector(state, 'startingFuel');
  const startingLapValue = selector(state, 'startingLap');

  return { 
    drivers, 
    track,
    car,
    lpg,
    startValue,
    endValue,
    startingFuelValue,
    startingLapValue
  };
}

export default connect(mapStateToProps, { createRaceStint })(StintForm);
