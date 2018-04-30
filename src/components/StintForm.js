import _ from 'lodash';

import React, { Component } from 'react';
import { Form, FormGroup, Label, Input, Button } from 'reactstrap';

import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { createRaceStint } from '../actions';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

class StintForm extends Component {
  constructor(props) {
    super(props);

    moment.locale('en');
    momentLocalizer();
  }

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

  fixDate(value) {
    if (value === null) {
      return moment().format('Y-MM-DDTH:mm:ss');
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
    
    console.log('returning formatted value:',v.format('Y-MM-DDTH:mm:ss'));
    return v.format('Y-MM-DDTH:mm:ss'); 
    */
  }

  render() {
    const { handleSubmit, onSubmit, pristine, reset, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Starts</Label>
          <Field name="start" format={this.fixDate} component="input" className="form-control" type="datetime-local" step="1" />
        </FormGroup>

        <FormGroup>
          <Label>Ends</Label>
          <Field name="stop" format={this.fixDate} component="input" className="form-control" type="datetime-local" step="1" />
        </FormGroup>

        <FormGroup>
          <Label>Driver</Label>
          <Field name="driver" component="select">
            <option key='' value=''>- Select a Driver -</option>
            {_.map(this.props.drivers, ({ id, firstname, lastname }) => <option key={id} value={id}>{firstname} {lastname}</option>)}
          </Field>
        </FormGroup>

        <FormGroup>
          <Label>Notes</Label>
          <Field name="notes" component="textarea" />
        </FormGroup>
      </Form>
    );
  }
}

StintForm = reduxForm({
  form: 'StintForm',
})(StintForm);

function mapStateToProps(state, ownProps) {
  const drivers = state.drivers;
  const race = state.races[ownProps.raceId];

  return { 
    drivers, 
    race,
  };
}

export default connect(mapStateToProps, { createRaceStint })(StintForm);
