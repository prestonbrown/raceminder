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

import { Field, reduxForm, change } from 'redux-form';
import { Col, Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
import { Multiselect } from 'react-widgets';
import InputMask from 'react-input-mask';

import { BarLoader } from 'react-spinners';

import { createRace, createTrack } from '../actions';

import TrackModal from './TrackModal';
import Log from './Log';

import 'react-widgets/dist/css/react-widgets.css';
import '../styles/racescreate.css';


/*
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
*/

class RacesCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      edit: false,
      modalOpen: false,
      loading: true
    };

    moment.locale('en');
    momentLocalizer();
  }

  componentWillMount() {
    let id = null;
    if (this.props.match && this.props.match.params.id) {
      id = this.props.match.params.id;
    } else {
      this.setState({ loading: false });
    }
    const { races } = this.props;
    const race = races && id ? races[id] : null;

    if (race) {
      //console.log('edit race initial values: ', race);
      this.setState({ edit: true, loading: false });
      this.props.initialize(race);
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props.races !== newProps.races) {
      const { races } = newProps;
      let id = null;
      if (this.props.match && this.props.match.params.id) {
        id = this.props.match.params.id;
      }
      const race = races && id ? races[id] : null;

      if (race) {
        this.setState({ edit: true, loading: false });
        this.props.initialize(race);
      }
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

  handleModalClose = () => {
    this.setState({ modalOpen: false});
  }

  openModal = () => {
    this.setState({ modalOpen: true });
  }

  onTrackSubmit = values => {
    this.props.createTrack(values);
  }

  renderField(field) {
    const {meta: {touched, error}, label, input, ...rest} = field;
    return (
      <FormGroup row>
        <Label sm={2}>{label}</Label>
        <Col sm={4}>
          <Input 
            valid={touched && error ? false : (touched ? true : null) } 
            invalid={touched && error ? true : false } 
            {...input} 
            {...rest}
          />
        <FormFeedback>{error}</FormFeedback>
        </Col>
      </FormGroup>
    );    
  }

  renderTrackField(field) {
    const {meta: {touched, error}} = field;

    return (
      <div>
        <Input
          valid={touched && error ? false : (touched ? true : null) } 
          invalid={touched && error ? true : false } 
          {...field.input} 
          type="select">
          <option key='' value=''>- Select a Track -</option>
          {_.map(this.props.tracks, track => <option key={track.id} value={track.id}>{track.name}</option>)}
        </Input>
        <FormFeedback>{error}</FormFeedback>
      </div>
    );
  }

  renderCarsMultiSelect(field) {
    const { meta: { touched, error }, input } = field;

    const data = _.map(this.props.cars, car => ({ id: car.id, name: car.name }));
    const inputProps = {};
    if (touched && error) {
      inputProps.invalid = '';
    } else if (touched && !error) {
      inputProps.valid = '';
    }

    console.log('cars error: ', error);
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
            placeholder="Enter cars"
          />
          <FormFeedback style={ { display: touched && error ? "block" : "hidden" } }>{error}</FormFeedback>
        </Col>
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
          <FormFeedback>{error}</FormFeedback>
        </Col>
        <Col>
          <span>or <Button color="secondary" className="ml-2" tag={Link} to="/cars/create">Create New Car</Button></span>
        </Col>
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
            placeholder="Enter driver names"
          />
          <FormFeedback style={ { display: touched && error ? "block" : "hidden" } }>{error}</FormFeedback>
        </Col>
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
        <FormFeedback>{error}</FormFeedback>
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

    if (this.state.loading) {
      return(
        <div style={{position: 'fixed', top: '50%', left: '50%', marginLeft: '-50px' }}>
          <BarLoader color={'#123abc'} loading={this.state.loading} />      
        </div>
        );
    }

    return (
      <div>
        <h3>{this.state.edit ? 'Edit Race' : 'Create New Race'}</h3>
        <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field label="Race Name" name="name" type="text" component={this.renderField} />
          <FormGroup className="row">
            <Col sm={2}>
              <Label>Track</Label>
            </Col>
            <Col sm={4}>
              <Field label="Track" name="track" component={this.renderTrackField.bind(this)} />
            </Col>
            <Col>
              <span>or <Button onClick={this.openModal} className="ml-2">Create New Track</Button></span>
            </Col>
          </FormGroup>

          {/* <Field label="Car" name="car" component={this.renderCarField.bind(this)} /> */}
          <Field label="Cars" name="cars" parse={values => { if (!values) return; return values.map(value => value.id); }} component={this.renderCarsMultiSelect.bind(this)} />
          <Field label="Drivers" name="drivers" parse={values => { if (!values) return; return values.map(value => value.id); }} component={this.renderDriversMultiSelect.bind(this)} />

          <Field label="Scheduled Start" name="start" type="datetime-local" component={this.renderField} />
          <Field label="Scheduled Finish" name="end" type="datetime-local" component={this.renderField} />

          <Field label="Required Stops" name="requiredStops" type="number" component={this.renderField} />
          <Field 
            label="Average Lap Time" 
            parse={(val) => { 
              let mins = parseInt(val.slice(0, 1), 10);
              let tensSecs = parseInt(val.slice(2,3), 10);
              let secs = parseInt(val.slice(3), 10);
              let res = 0;
              if (mins) {
                res += mins * 60;
              }
              if (tensSecs) {
                res += tensSecs * 10;
              }
              if (secs) {
                res += secs;
              }

              //console.log('mins',mins,'tensSecs',tensSecs,'secs',secs);
              //console.log('parsed result in seconds:',res);
              return res;
            }}
            format={(val) => { 
              if (!val) { 
                return ''; 
              } 
              let mins = parseInt(val / 60, 10);
              let secs = parseInt(val % 60, 10);
              let res = `${mins}:`.padStart(2, '0') + `${secs}`.padStart(2, '0');
              //console.log('format input:',val,', result:',res, 'String(val % 60)',String(val%60)); 
              return res; 
            }}
            name="avgLapTime" 
            mask="C:AB" 
            tag={InputMask} 
            maskChar="_" 
            formatChars={{ 'C': '[0-9]', 'A': '[0-5]', 'B': '[0-9]' }} 
            component={this.renderField} 
          />

          <Field label="Default Stint Length (hrs)" name="stintLength" type="number" component={this.renderField} />          
          <Field label="Race Hero Race Name" name="raceHeroName" type="text" component={this.renderField} />
          <Field label="Race Monitor Race ID" name="raceMonitorId" type="number" component={this.renderField} />
          <Field label="Podium Live Event ID" name="podiumEventId" type="text" component={this.renderField} />
          <div className="btn-toolbar float-right">
            <Button type="submit" color="primary" className="mr-1" disabled={pristine || submitting}>Save</Button>
            <Button color="secondary" onClick={this.props.history.goBack}>Cancel</Button>
          </div>
        </Form>

        <TrackModal 
          isOpen={this.state.modalOpen}
          onClose={this.handleModalClose}
          handleSubmit={this.onTrackSubmit}
          />
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

  if (!Array.isArray(values.cars) || values.cars.length === 0) {
    errors.cars = 'You must select at least one car.'
  }

  if (!Array.isArray(values.drivers) || values.drivers.length === 0) {
    errors.drivers = 'You must select one or more drivers.';
  }

  return errors;
}

function mapStateToProps({ drivers, tracks, cars, races }) {
  return { drivers, tracks, cars, races };
}

RacesCreate = connect(mapStateToProps, { createRace, createTrack })(RacesCreate);

export default reduxForm({
  form: 'RacesCreateForm',
  // optional: fields argument with names of Fields
  //fields: _.keys(FIELDS),
  validate
})(withRouter(RacesCreate));
