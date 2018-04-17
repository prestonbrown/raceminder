//import _ from 'lodash';
import React, { Component } from 'react';
import { connect, dispatch } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import { Field, reduxForm } from 'redux-form';
import { Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
//import { Multiselect } from 'react-widgets';

import { createCar } from '../actions';

import 'react-widgets/dist/css/react-widgets.css';

class CarsCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false
    };
  }

  onSubmit(values) {
    // this === our component
    this.props.createCar(values);
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

  /*
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
  */

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    // if the form has been submitted, redirect
    // will be set.
    if (this.state.redirect) {
      return <Redirect to="/" />;
    }

    return (
      <div>
        <h3>Create New Car</h3>
        <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field label="Car Name / Number" name="name" type="text" component={this.renderField} />
          <Field label="Make / Model" name="model" type="text" component={this.renderField} />
          <Field label="Fuel Capacity" name="fuelCapacity" type="number" component={this.renderField} />
          <Field label="Desired Fuel Reserve" name="desiredFuelReserve" type="number" component={this.renderField} />

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
    errors.name = 'You must enter a name/number for the car.';
  }

  if (!values.model) {
    errors.track = 'You must provide the make and model.';
  }

  if (!values.fuelCapacity) {
    errors.drivers = 'You must provide the fuel capacity in gallons.';
  }

  if (!values.desiredFuelReserve) {
    errors.drivers = 'You must provide the desired fuel reserve in gallons.';
  }

  return errors;
}

const mapStateToProps = (state) => ({ cars: state.cars });

CarsCreate = connect(mapStateToProps, { createCar })(CarsCreate);

export default reduxForm({
  form: 'CarsCreateForm',
  // optional: fields argument with names of Fields
  //fields: _.keys(FIELDS),
  validate
})(CarsCreate);
