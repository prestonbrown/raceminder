//import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Field, reduxForm } from 'redux-form';
import { Form, FormGroup, Label, Input, FormFeedback, Button } from 'reactstrap';
//import { Multiselect } from 'react-widgets';

import ReactCrop, { makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { createCar } from '../actions';

import 'react-widgets/dist/css/react-widgets.css';

const adaptFileEventToValue = delegate => e => {
  delegate(e.target.files[0]);
  if (e.target.files[0]) {
    // convert picture to DataURL (Base64)
    let reader = new FileReader();
    reader.addEventListener('load', function() {
      document.getElementsByClassName('ReactCrop__image')[0].src = reader.result;
    }, false);

    reader.readAsDataURL(e.target.files[0]);
  }
};

const FileInput = ({ 
  input: { value: omitValue, onChange, onBlur, ...inputProps }, 
  meta: omitMeta, 
  ...props 
  }) => {
  return (
    <input
      onChange={adaptFileEventToValue(onChange)}
      onBlur={adaptFileEventToValue(onBlur)}
      type="file"
      {...props.input}
      {...props}
    />
  );
};

class CarsCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false,
      edit: false,
      crop: {
        aspect: 1,
      }
    };
  }

  componentWillMount() {
    let id = null;
    if (this.props.match && this.props.match.params.id) {
      id = this.props.match.params.id;
    }
    const { cars } = this.props;
    const car = cars && id ? cars[id] : null;

    if (car) {
      console.log('edit car initial values: ', car);
      this.setState({ edit: true });
      this.setState({ id: id });
      this.props.initialize(car);
    }
  }

  onImageLoaded = image => {
    this.setState({
      crop: makeAspectCrop({
        x: 0,
        y: 0,
        width: 100,
        aspect: 1,
      }, image.width / image.height),
    });
  }

  cropImage = () => { 
    const canvas = document.createElement('canvas');
    const img = document.getElementsByClassName('ReactCrop__image')[0];
    const { pixelCrop } = this.state;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      document.getElementsByClassName('ReactCrop__image')[0],
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height);

    console.log('displaying crop on canvas');
    // convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(file => {
        file.name = "Preview";
        resolve(file);
      }, 'image/jpeg');
    });
  }

  onSubmit(values) {
    // this === our component
    console.log(values);
    return;

    if (values.picture) {
      // convert picture to DataURL (Base64)
      let reader = new FileReader();
      reader.addEventListener('load', function() {
        // do something here
      }, false);

      reader.readAsDataURL(values.picture);
    }

    this.props.createCar(values);
    this.setState({ redirect: true });
  }

  renderField(field) {
    const {meta: {touched, error}, autoFocus } = field;
    return (
      <FormGroup>
        <Label>{field.label}</Label>
        <Input 
          valid={touched && error ? false : (touched ? true : null) } 
          invalid={touched && error ? true : false } 
          {...field.input} 
          type={field.type}
          autoFocus={autoFocus ? true : null}
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
    const { handleSubmit, pristine, submitting } = this.props;

    // if the form has been submitted, redirect
    // will be set.
    if (this.state.redirect) {
      this.props.history.goBack();
      return null;
    }

    return (
      <div>
        <h3>Create New Car</h3>
        <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field label="Car Name / Number" name="name" type="text" autoFocus component={this.renderField} />
          <Field label="Make / Model" name="model" type="text" component={this.renderField} />
          <Field label="Fuel Capacity" name="fuelCapacity" type="number" component={this.renderField} />
          <Field label="Desired Fuel Reserve" name="desiredFuelReserve" type="number" component={this.renderField} />

          <FormGroup>
            <Label>Picture</Label>
            <Field name="picture" type="file" component={FileInput} />
            <div style={{minWidth: '150px', maxWidth: '150px', minHeight: '150px', background: '#F2F2F2', outline: '2px dashed #000', outlineOffset: '-10px' }}>
              <ReactCrop 
                crop={this.state.crop} 
                name="preview" 
                src="" 
                onChange={crop => { this.setState({ crop }); }} 
                onComplete={(crop, pixelCrop) => {console.log('crop:',crop); console.log('pixel crop:',pixelCrop); this.setState({ pixelCrop }); }}
                onImageLoaded={this.onImageLoaded.bind(this)} 
              />
            </div>
            <Button name="crop" onClick={this.cropImage}>Crop</Button>
          </FormGroup>

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
})(withRouter(CarsCreate));

