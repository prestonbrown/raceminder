/**
 * RaceMinder Race Information System
 * Copyright (c) 2018 Preston Brown & Loose Canon Racing LLC.
 * License: MIT
 */

import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

import { Field, reduxForm } from 'redux-form';
import { Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
import { Multiselect, DateTimePicker } from 'react-widgets';

import { createRace } from '../actions';

import 'react-widgets/dist/css/react-widgets.css';

const renderDateTimePicker = ({ input: { onChange, value }, showTime }) =>
  <DateTimePicker
    onChange={onChange}
    format="DD MMM YYYY hh::mm:ss"
    time={showTime}
    value={!value ? null : new Date(value)}
  />

class RacesCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      edit: false
    };

    Moment.locale('en');
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
      this.setState({ edit: true });
      this.props.initialize(race);
    }
  }

  onSubmit(values) {
    // this === our component
    console.log(values);
    this.props.createRace(values);
    this.setState({ redirect: true });
  }

  renderField(field) {
    const {meta: {touched, error}} = field;
    return (
      <FormGroup>
        <Label>{field.label}</Label>
        <Input 
          valid={touched && error ? false : (touched ? true : null) } 
          invalid={touched && error ? true : false } 
          {...field.input} 
          type={field.type} 
          />
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
      <FormGroup>
        <Label>{field.label}</Label>
        <Input 
          valid={touched && error ? false : (touched ? true : null) } 
          invalid={touched && error ? true : false } 
          {...field.input} 
          type="select">
          <option key='' value=''>- Select a Car -</option>
          {_.map(this.props.cars, car => <option key={car.id} value={car.id}>{car.name}: {car.model}</option>)}
        </Input>
        or
        <Button color="secondary" tag={Link} to="/cars/create">Create New Car</Button>
        <FormFeedback>{error}</FormFeedback>
        </FormGroup>
      );
  }

  renderDriversMultiSelect(field) {
    const {meta: {touched, error}} = field;

    const data = _.map(this.props.drivers, driver => driver);
    const inputProps = {};
    if (touched && error) {
      inputProps.invalid = '';
    } else if (touched && !error) {
      inputProps.valid = '';
    }

    return (
      <FormGroup>
        <Label>{field.label}</Label>
        <Multiselect 
          defaultValue={field.input.value || []}
          onBlur={() => field.input.onBlur()}
          onChange={field.input.onChange}
          data={data}
          valueField="id"
          textField="name"
          inputProps={inputProps}
          />
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
          {_.map(this.props.drivers, (driver) => <option key={driver.id}>{driver.name}</option>)}
        </select>
      </FormGroup>
      );
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;
    
    // if the form has been submitted, redirect
    // will be set.
    if (this.state.redirect) {
      return <Redirect to="/races/" />;
    }

    return (
      <div>
        <h3>{this.state.edit ? 'Edit Race' : 'Create New Race'}</h3>
        <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field label="Race Name" name="name" type="text" component={this.renderField} />
          <Field label="Track" name="track" component={this.renderTrackField.bind(this)} />
          <Field label="Car" name="car" component={this.renderCarField.bind(this)} />
          <Field label="Drivers" name="drivers" component={this.renderDriversMultiSelect.bind(this)} />
          <Field label="Start Time" name="start" component={renderDateTimePicker} />
          <Field label="End Time" name="end" component={renderDateTimePicker} />
          <Field label="Required Stops" name="requiredStops" type="number" component={this.renderField} />
          <div className="btn-toolbar">
            <Button type="submit" color="primary" disabled={pristine || submitting}>Save</Button>
            <Button color="secondary" tag={Link} to="/">Cancel</Button>
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
  return { drivers: drivers.driverList, tracks, cars, races };
}

RacesCreate = connect(mapStateToProps, { createRace })(RacesCreate);

export default reduxForm({
  form: 'RacesCreateForm',
  // optional: fields argument with names of Fields
  //fields: _.keys(FIELDS),
  validate
})(RacesCreate);
