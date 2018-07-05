import React, { Component } from 'react';
import { Label, Form, FormGroup, Button, 
  Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { Field, submit, reduxForm } from 'redux-form';

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

class TrackForm extends Component {
  componentWillReceiveProps(newProps) {
    const { track } = newProps;
   
    if (track && track != this.props.track) {
      this.props.initialize(track);
    }
  }

  render() {
    const { handleSubmit, pristine, reset, submitting } = this.props;

    return (
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Name</Label>
          <Field name="name" component="input" className="form-control" />
        </FormGroup>

        <FormGroup>
          <Label>Length</Label>
          <Field name="length" component="input" type="number" className="form-control" />
        </FormGroup>

        <FormGroup>
          <Label>Track Map Picture</Label>
          <Field name="map" component={FileInput} className="form-control" />
        </FormGroup>
      </Form>
    );
  }
}

TrackForm = reduxForm({
  form: 'TrackForm'
})(TrackForm);


const TrackSubmitButton = connect()(({ dispatch }) => (
  <Button color="primary" onClick={() => dispatch(submit('TrackForm'))}>Save</Button>
  ));

class TrackModal extends Component {
  toggle = () => {
    this.props.onClose();
  }

  handleSubmit(values) {
    console.log('track got submitted, values:', values);
    this.props.handleSubmit(values);
    this.toggle();
  }

  renderForm() {
    const { track } = this.props;

    return (
      <section>
        <ModalHeader toggle={this.toggle}>Track Details</ModalHeader>
        <ModalBody>
            <TrackForm 
              track={track}
              onSubmit={this.handleSubmit.bind(this)} 
            />
        </ModalBody>

        <ModalFooter>
          <TrackSubmitButton className="mr-1" />
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>        
      </section>
    );
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.toggle} className={`${this.props.className}`}>
        {this.renderForm()}
      </Modal>
      );    
  }
}

export default TrackModal;