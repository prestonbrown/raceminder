/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

import { Field, reduxForm } from 'redux-form';
import { Col, Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
import { Multiselect, DateTimePicker } from 'react-widgets';

import { createRace } from '../actions';

import 'react-widgets/dist/css/react-widgets.css';

const renderDateTimePicker = ({ input: { onChange, value }, showTime }) =>
  <FormGroup row>
    <Label sm={2}></Label>
    <Col sm={10}>
      <DateTimePicker
        onChange={onChange}
        format="DD MMM YYYY hh::mm:ss"
        time={showTime}
        value={!value ? null : new Date(value)}
      />
    </Col>
  </FormGroup>;

class RacesCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      edit: false
    };

    moment.locale('en');
    momentLocalizer();
  }

  componentWillMount() {
    let id = null;
    if (this.props.match && this.props.match.params.id) {
      id = this.props.match.params.id;
    }
    const { races } = this.props;
    const race = races && id ? races[id] : null;

    if (race) {
      console.log('edit race initial values: ', race);
      this.setState({ edit: true });
      this.setState({ id: id });
      this.props.initialize(race);
    }
  }

  onSubmit(values) {
    // this === our component
    const raceValues = values;
    if (this.state.id) {
      raceValues.id = this.state.id;
    }

    //console.log('submitted raceValues: ', raceValues);
    this.props.createRace(raceValues);
    this.setState({ redirect: true });
  }

  renderField(field) {
    const {meta: {touched, error}} = field;
    return (
      <FormGroup row>
        <Label sm={2}>{field.label}</Label>
        <Col sm={10}>
          <Input 
            valid={touched && error ? false : (touched ? true : null) } 
            invalid={touched && error ? true : false } 
            {...field.input} 
            type={field.type} 
          />
        </Col>
        <FormFeedback>{error}</FormFeedback>
      </FormGroup>
    );    
  }

  renderTrackField(field) {
    const {meta: {touched, error}} = field;

    return (
      <FormGroup>
        <Label>{field.label}</Label>
        <Input 
          valid={touched && error ? false : (touched ? true : null) } 
          invalid={touched && error ? true : false } 
          {...field.input} 
          type="select">
          <option key='' value=''>- Select a Track -</option>
          {_.map(this.props.tracks, track => <option key={track.id} value={track.id}>{track.name}</option>)}
        </Input>
        <FormFeedback>{error}</FormFeedback>
      </FormGroup>
    );
  }

  renderCarField(field) {
    const {meta: {touched, error}} = field;

    return (
      <FormGroup className="row">
        <Label sm={2}>{field.label}</Label>
        <Col sm={4}>
          <Input 
            valid={touched && error ? false : (touched ? true : null) } 
            invalid={touched && error ? true : false } 
            {...field.input} 
            type="select">
            <option key='' value=''>- Select a Car -</option>
            {_.map(this.props.cars, car => <option key={car.id} value={car.id}>{car.name}: {car.model}</option>)}
          </Input>
        </Col>
        <Col sm={4}>
          <p>or <Button color="secondary" tag={Link} to="/cars/create">Create New Car</Button></p>
        </Col>
        <FormFeedback>{error}</FormFeedback>
      </FormGroup>
    );
  }

  renderDriversMultiSelect(field) {
    const { meta: { touched, error }, input } = field;

    const data = _.map(this.props.drivers, driver => ({ id: driver.id, name: driver.firstname + ' ' + driver.lastname }));
    const inputProps = {};
    if (touched && error) {
      inputProps.invalid = '';
    } else if (touched && !error) {
      inputProps.valid = '';
    }

    return (
      <FormGroup row>
        <Label sm={2}>{field.label}</Label>
        <Col sm={10}>
          <Multiselect
            { ...input }
            onBlur={() => input.onBlur()}
            value={input.value || []} // requires value to be an array
            data={data}
            //defaultValue={input.value || []}
            valueField="id"
            textField="name"
            inputProps={inputProps}
          />
        </Col>
        <FormFeedback>{error}</FormFeedback>
      </FormGroup>
    );
  }

  renderDriversSelect(field) {
    const {meta: {touched, error}} = field;
    const className = `${touched && error ? 'has-danger' : ''}`;

    return (
      <FormGroup className={className}>
        <Label>{field.label}</Label>
        <select {...field.input}>
          <option key="">Choose a Driver</option>
          {_.map(this.props.drivers, (driver) => <option key={driver.id}>{driver.firstname} {driver.lastname}</option>)}
        </select>
      </FormGroup>
    );
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;
    
    // if the form has been submitted, redirect
    // will be set.
    if (this.state.redirect) {
      this.props.history.goBack();
      return null;
    }

    return (
      <div>
        <h3>{this.state.edit ? 'Edit Race' : 'Create New Race'}</h3>
        <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field label="Race Name" name="name" type="text" component={this.renderField} />
          <Field label="Track" name="track" component={this.renderTrackField.bind(this)} />
          <Field label="Car" name="car" component={this.renderCarField.bind(this)} />
          <Field label="Drivers" name="drivers" parse={(values, name) => { if (!values) return; return values.map(value => value.id) }} component={this.renderDriversMultiSelect.bind(this)} />
          <Field label="Starts On" name="start" type="datetime-local" component={this.renderField} />
          <Field label="Ends On" name="end" type="datetime-local" component={this.renderField} />
          <Field label="Required Stops" name="requiredStops" type="number" component={this.renderField} />
          <Field label="Default Stint Length (hrs)" name="stintLength" type="number" component={this.renderField} />          
          <div className="btn-toolbar">
            <Button type="submit" color="primary" disabled={pristine || submitting}>Save</Button>
            <Button color="secondary" onClick={this.props.history.goBack}>Cancel</Button>
          </div>
        </Form>
      </div>
    );
  }
}

function validate(values) {
  const errors = {};

  if (!values.name) {
    errors.name = 'You must enter a name for the race.';
  }

  if (!values.track || values.track === '') {
    errors.track = 'You must choose a track.';
  }

  if (!values.drivers) {
    errors.drivers = 'You must select one or more drivers.';
  }

  return errors;
}

function mapStateToProps({ drivers, tracks, cars, races }) {
  return { drivers, tracks, cars, races };
}

RacesCreate = connect(mapStateToProps, { createRace })(RacesCreate);

export default reduxForm({
  form: 'RacesCreateForm',
  // optional: fields argument with names of Fields
  //fields: _.keys(FIELDS),
  validate
})(withRouter(RacesCreate));
