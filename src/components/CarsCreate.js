//import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { Field, reduxForm, change, formValueSelector } from 'redux-form';
import { Form, FormGroup, Label, Input, FormFeedback, Button, 
  Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import ReactCrop, { makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import { createCar } from '../actions';

import 'react-widgets/dist/css/react-widgets.css';

class CropModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
      crop: { aspect: 1 },
      processed: false
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    //console.log('in getDerivedStateFromProps, nextProps:',nextProps,', prevState:', prevState);
    if (nextProps.isOpen !== prevState.isOpen) {
      return {
        isOpen: nextProps.isOpen
      };
    }

    // no state update necessary
    return null;
  }

  lanczosCreate(lobes) {
    return function(x) {
      if (x > lobes) {
        return 0;
      }

      x *= Math.PI;
      if (Math.abs(x) < 1e-16) {
        return 1;
      }

      let xx = x / lobes;
      return Math.sin(x) * Math.sin(xx) / x / xx;
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
      processed: false
    });
  }

  handleClose = () => {
    const img = document.getElementsByClassName('ReactCrop__image')[0];
    const { pixelCrop } = this.state;

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      img,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height);

    let data = canvas.toDataURL('image/jpeg', 0.7);
    img.src = data;

    this.setState({ crop: { width: 0, height: 0 } });

    // callback to update preview
    this.props.onCrop(data);
    this.setState({ isOpen: false });
  }

  /**
   * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
   * 
   * @param {HtmlElement} canvas
   * @param {int} width
   * @param {int} height
   * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
   */
  resampleImage(canvas, width, height, resizeCanvas = false) {
    let width_source = canvas.width;
    let height_source = canvas.height;
    width = Math.round(width);
    height = Math.round(height);

    let ratio_w = width_source / width;
    let ratio_h = height_source / height;
    let ratio_w_half = Math.ceil(ratio_w / 2);
    let ratio_h_half = Math.ceil(ratio_h / 2);

    let ctx = canvas.getContext("2d");
    let img = ctx.getImageData(0, 0, width_source, height_source);
    let img2 = ctx.createImageData(width, height);
    let data = img.data;
    let data2 = img2.data;

    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let x2 = (i + j * width) * 4;
        let weight = 0;
        let weights = 0;
        let weights_alpha = 0;
        let gx_r = 0;
        let gx_g = 0;
        let gx_b = 0;
        let gx_a = 0;
        let center_y = (j + 0.5) * ratio_h;
        let yy_start = Math.floor(j * ratio_h);
        let yy_stop = Math.ceil((j + 1) * ratio_h);
        for (let yy = yy_start; yy < yy_stop; yy++) {
          let dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
          let center_x = (i + 0.5) * ratio_w;
          let w0 = dy * dy; //pre-calc part of w
          let xx_start = Math.floor(i * ratio_w);
          let xx_stop = Math.ceil((i + 1) * ratio_w);
          for (let xx = xx_start; xx < xx_stop; xx++) {
            let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
            let w = Math.sqrt(w0 + dx * dx);
            if (w >= 1) {
              //pixel too far
              continue;
            }

            //hermite filter
            weight = 2 * w * w * w - 3 * w * w + 1;
            let pos_x = 4 * (xx + yy * width_source);
            //alpha
            gx_a += weight * data[pos_x + 3];
            weights_alpha += weight;
            //colors
            if (data[pos_x + 3] < 255)
              weight = weight * data[pos_x + 3] / 250;
            gx_r += weight * data[pos_x];
            gx_g += weight * data[pos_x + 1];
            gx_b += weight * data[pos_x + 2];
            weights += weight;
          }
        }
        data2[x2] = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights_alpha;
      }
    }

    //clear and resize canvas
    if (resizeCanvas === true) {
      canvas.width = width;
      canvas.height = height;
    } else {
      ctx.clearRect(0, 0, width_source, height_source);
    }

    //draw
    ctx.putImageData(img2, 0, 0);
  }

  onImageLoaded = image => {
    if (this.state.processed) {
      return;
    }

    //console.log('in onImageLoaded, image:', image)
    /*
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);

    const rWidth = Math.round(image.width * (512 / image.height));
    const rHeight = 512;
    console.log('rWidth:',rWidth,', rHeight:',rHeight);
    // OR do this:
    //this.resampleImage(canvas, rWidth, rHeight);

    if (image.height > 512) {
        image.width = rWidth;
        image.height = rHeight;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height);
      
    image.src = canvas.toDataURL('image/jpeg');
    */

    console.log('in onimageloaded');
    this.setState({
      crop: makeAspectCrop({
        x: 0,
        y: 0,
        width: 100,
        aspect: 1,
      }, image.width / image.height),
      processed: true
    });
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.state.isOpen} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Crop Car Picture</ModalHeader>
          <ModalBody>
            <div style={{minWidth: '150px', maxWidth: '150px', minHeight: '150px', background: '#F2F2F2', outline: '2px dashed #000', outlineOffset: '-10px' }}>
              <ReactCrop 
                crop={this.state.crop} 
                name="crop" 
                src={this.props.picture ? this.props.picture : ''} 
                onChange={crop => { this.setState({ crop }); }} 
                onComplete={(crop, pixelCrop) => {this.setState({ pixelCrop }); }}
                onImageLoaded={this.onImageLoaded.bind(this)} 
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" onClick={this.handleClose}>Save</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const readFileAsDataURI = (inputFile) => {
  const temporaryFileReader = new FileReader();

  return new Promise((resolve, reject) => {
    temporaryFileReader.onerror = () => {
      temporaryFileReader.abort();
      reject(new DOMException("Problem parsing input file."));
    };

    temporaryFileReader.onload = () => {
      resolve(temporaryFileReader.result);
    };
    temporaryFileReader.readAsDataURL(inputFile);
  });
};

const adaptFileEventToValue = delegate => e => {
  // convert File object to DataURI
  readFileAsDataURI(e.target.files[0])
    .then(data => { 
      delegate(data);
    })
    .catch(err => console.error(err));

  //delegate(e.target.files[0]);
};

const FileInput = ({ 
  input: { value: omitValue, onChange, onClick, onBlur, ...inputProps }, 
  meta: omitMeta, 
  ...props 
  }) => {
  return (
    <input
      onChange={adaptFileEventToValue(onChange)}
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

  onSubmit(values) {
    // this === our component

    new Promise((resolve, reject) => {
      if (values.picture && values.picture.name) {
        // convert picture to DataURL (Base64)
        readFileAsDataURI(values.picture)
          .then(data => values.picture = data)
          .catch(err => console.log(err));
      }
      resolve();
    })
      .then(() => {
        console.log('submitted values for car:',values);

        this.props.createCar(values);
        this.setState({ redirect: true });
      })
      .catch(err => console.error(err));
  }

  renderField(field) {
    const { meta: { touched, error }, autoFocus } = field;
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

  handleCrop(data) {
    let headStr = 'data:image/jpeg;base64,';
    console.log('original picture size:', Math.round((this.props.pictureValue.length - headStr.length) * 3/4/1024) + 'k');
    //console.log('new cropped picture size:', Math.round((data.length - headStr.length) * 3/4/1024) + 'k');
    this.props.change('picture', data);

    console.log('after change, picture size:',Math.round((this.props.pictureValue.length - headStr.length) * 3/4/1024) + 'k');

    // make sure we tell modal to get gone
    this.setState({ modalOpen: false });
    let img = document.getElementById('preview');
    img.src = data;
  }

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
        <div>
          <img id="preview" className="float-right rounded-circle mr-1" src={this.props.pictureValue} alt="Car Preview" style={{ maxWidth: '100px', maxHeight: '100px', width: '100px', height: '100px', boxShadow: '0 4px 10px 0 rgba(0,0,0,0.6)' }} />
        </div>
        <h3 className="clearfix">Create New Car</h3>
        <Form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
          <Field label="Car Name / Number" name="name" type="text" autoFocus component={this.renderField} />
          <Field label="Make / Model" name="model" type="text" component={this.renderField} />
          <Field label="Fuel Capacity" name="fuelCapacity" type="number" component={this.renderField} />
          <Field label="Desired Fuel Reserve" name="desiredFuelReserve" type="number" component={this.renderField} />

          <FormGroup>
            <Label for="picture-file" className="btn btn-secondary">Choose a Picture</Label>
            <Field 
              name="picture" 
              type="file" 
              accept="image/*" 
              onChange={() => { console.log('setting state for modal to open'); this.setState({ modalOpen: true }); }}
              className="d-none"
              id="picture-file"
              component={FileInput} 
            />
            <CropModal 
              isOpen={this.state.modalOpen} 
              onCrop={this.handleCrop.bind(this)}
              picture={this.props.pictureValue} />
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

CarsCreate = reduxForm({
  form: 'CarsCreateForm',
  // optional: fields argument with names of Fields
  //fields: _.keys(FIELDS),
  validate
})(withRouter(CarsCreate));

// decorate with connect to read form values.
const selector = formValueSelector('CarsCreateForm');

function mapStateToProps(state, ownProps) {
  return { 
    pictureValue: selector(state, 'picture'),
    cars: state.cars 
  }
}

export default connect(mapStateToProps, { createCar, change })(CarsCreate);
