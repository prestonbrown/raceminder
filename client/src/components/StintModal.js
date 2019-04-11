import React, { Component } from 'react';
import { connect } from 'react-redux';
import { submit } from 'redux-form';

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import { createRaceStint } from '../actions/index';

import StintForm from './StintForm';

const StintSubmitButton = connect()(({ dispatch }) => (
  <Button color="primary" onClick={() => dispatch(submit('StintForm'))}>Save</Button>
  ));

class StintModal extends Component {
  toggle = () => {
    this.props.onClose();
  }

  handleStintSubmit(values) {
    const { race, carId } = this.props;
    console.log('stint got submitted, values:', values);
    this.props.createRaceStint(race.id, carId, values);
    this.toggle();
  }

  renderForm() {
    const { race, carId, stintId } = this.props;
    return (
      <section>
        <ModalHeader toggle={this.toggle}>Stint Details</ModalHeader>
        <ModalBody>
            <StintForm 
              race={race}
              carId={carId}
              stintId={stintId} 
              onSubmit={this.handleStintSubmit.bind(this)} 
            />
        </ModalBody>

        <ModalFooter>
          <StintSubmitButton className="mr-1" />
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>        
      </section>
    );
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.toggle} className={`${this.props.className} modal-lg`}>
        {this.renderForm()}
      </Modal>
      );    
  }
}

export default StintModal = connect(null, { createRaceStint })(StintModal);
