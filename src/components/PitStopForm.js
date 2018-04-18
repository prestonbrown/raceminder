import React, { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';

import { createRaceStop } from '../actions';

import { driversReducer } from '../reducers/reducer_drivers';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

class PitStopForm extends Component {
  constructor(props) {
    super(props);

    moment.locale('en');
    momentLocalizer();
  }

  componentWillMount() {
    const { race, stopId } = this.props;
    const stop = race.stops[stopId];

    console.log('pitstop form got race:', race);
    console.log('pitstop form got stop:', stop);    
    console.log('pitstop form got stopId:', stopId);        
    if (stop) {
      //console.log('edit stop initial values: ', stop);
      this.props.initialize(stop);
    }
  }

  onSubmit(values) {
    console.log('submitted values for stop:', values);
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
        <FormGroup>
          <Label>Started At</Label>
          <Field name="start" component="input" className="form-control" type="datetime-local" step="1" />
        </FormGroup>

        <FormGroup>
          <Label>Ended At</Label>
          <Field name="stop" component="input" className="form-control" type="datetime-local" step="1" />
        </FormGroup>

        <FormGroup>
          <Label>Duration: {moment(moment(this.props.stopValue).diff(moment(this.props.startValue))).format('mm:ss')}</Label>
        </FormGroup>

        <FormGroup>
          <Label>Fuel Added</Label>
          <Field name="fuel" component="input" type="number" />
        </FormGroup>

        <FormGroup>
          <Label>Relieving Driver</Label>
          <Field name="driver" component="select" data={this.props.drivers} />
        </FormGroup>

        <FormGroup>
          <Label>Notes</Label>
        </FormGroup>

        <Button type="submit" color="primary" className="mr-1">Save</Button>
        <Button color="secondary">Cancel</Button>
      </Form>
    );
  }
}

PitStopForm = reduxForm({
  form: 'PitStopForm'
})(PitStopForm);

// decorate with connect to read form values.
const selector = formValueSelector('PitStopForm');

function mapStateToProps(state, ownProps) {
  const drivers = state.drivers;
  const race = state.races[ownProps.raceId];
  const startValue = selector(state, 'start');
  const stopValue = selector(state, 'stop');

  return { 
    drivers, 
    race,
    startValue,
    stopValue
  };
}

export default connect(mapStateToProps, { createRaceStop })(PitStopForm);
