import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Form, FormGroup, Label, Input, FormText, Button } from 'reactstrap';

import { createRace } from '../actions';

class RacesCreate extends Component {
  constructor(props) {
    super(props);

    const renderField = this.renderField.bind(this);
  }

  renderField(field) {
    const {meta: {touched, error}} = field;
    const className = `${touched && error ? 'has-danger' : ''}`;

    return (
      <FormGroup className={className}>
        <Label>{field.label}</Label>
        <Input {...field.input} type="text" />
        <FormText>{touched ? error : ''}</FormText>
      </FormGroup>
      );    
  }

  renderTrackField(field) {
    const {meta: {touched, error}} = field;
    const className = `${touched && error ? 'has-danger' : ''}`;

    return (
        <FormGroup className={className}>
          <div>Track Select Goes Here</div>
        </FormGroup>
      )
  }

  render() {
    const { handleSubmit } = this.props;
    return (
      <div>
        <h3>Create New Race</h3>
        <Form onSubmit={handleSubmit(values => console.log(values))}>
          <Field label="Race Name" name="name" component={this.renderField} />
          <Field label="Track" name="track" component={this.renderTrackField} />
          <Field label="Drivers" name="drivers" component="select">
            <option key="">Choose a Driver</option>
            {_.map(this.props.drivers, (driver) => <option key={driver.id}>{driver.name}</option>)}
          </Field>

          <div className="btn-toolbar">
            <Button type="submit" className="btn btn-primary">Save</Button>
            <Button className="btn btn-secondary">Cancel</Button>
          </div>
        </Form>
      </div>
      );
  }
}

function mapStateToProps({ drivers }) {
  return { drivers: drivers.driverList };
}

RacesCreate = connect(mapStateToProps)(RacesCreate);

export default reduxForm({
  form: 'RacesCreateForm',
  // optional: fields argument with names of Fields
  //fields: _.keys(FIELDS),
  fields: [ 'name', 'drivers' ],
  //validate
})(RacesCreate);
