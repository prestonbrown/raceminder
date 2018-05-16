import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { submit } from 'redux-form';

import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFlagCheckered from '@fortawesome/fontawesome-free-solid/faFlagCheckered';

import { createRaceStop, createRaceStint } from '../actions/index';

import StopWatch from './StopWatch';
import StopForm from './StopForm';

const StopSubmitButton = connect()(({ dispatch }) => (
  <Button color="primary" onClick={() => dispatch(submit('StopForm'))}>Save</Button>
  ));

class StopModal extends Component {
  constructor(props) {
    super(props);

    //console.log('stopmodal props:',props);
    this.state = {
      stopId: null,
      showTimer: true
    };
  }

  componentWillReceiveProps(newProps) {
    //console.log('stopmodal receiving new props:',newProps);
    if (this.state.stopId !== newProps.stopId) {
      this.setState({ stopId: newProps.stopId, showTimer: !newProps.stopId ? true : false });
    }
  }

  toggle = () => {
    this.props.onClose();
  }

  handleTimerStop = (start, end) => {
    const { race } = this.props;

    // if there is an active stint, set up the driver
    let driver = null;
    if (this.props.activeStintId) {
      driver = race.stints[this.props.activeStintId].driver;
    }

    // compute the new stopId so form will be updated
    // with these new values   
    //const newStopId = createStopId(race); 
    this.props.createRaceStop(race.id, {
      start: start.format('Y-MM-DDTHH:mm:ss'),
      end: end.format('Y-MM-DDTHH:mm:ss'),
      driver
    });

    this.setState({ showTimer: false });
  }

  handleStopSubmit(values) {
    const { race, activeStintId } = this.props;
    console.log('stop got submitted, values:', values);
    this.props.createRaceStop(race.id, values);
    this.setState({ showTimer: false });

    // if the stop comes in the middle of an active stint, split the stint
    // (end current stint early and add a new stint; adjust end and start times accordingly)
    if (activeStintId) {
      const activeStint = race.stints[activeStintId];
      const oldEnd = activeStint.end;
      activeStint.end = values.start;

      // update active stint so end time is properly reflected
      this.props.createRaceStint(race.id, activeStint);

      // if we are close to the next stint and driver changed to be the same as it lists,
      // assume we are adjusting the start time of the next existing stint (i.e.
      // not adding a new, not previously present stint).
      let now = moment();
      let matches = _.filter(race.stints, stint => {
        const duration = moment.duration(moment(stint.start).diff(now));
        const timeUntil = duration.asMinutes();
        return (stint.driver === values.driver && timeUntil > 0 && timeUntil <= 15);
      });

      if (matches.length) {
        const nextStint = matches[0];
        nextStint.start = values.end;

        this.props.createRaceStint(race.id, nextStint);
        this.toggle();
        return;
      }

      // otherwise, make a new stint by copying the old stint and using stop end 
      // time as stint start time, and ending it when the active stint used to be ending.
      const newStint = Object.assign({}, activeStint);
      newStint.id = null;
      newStint.start = values.end;
      newStint.end = oldEnd;
      newStint.driver = values.driver;

      // compute starting fuel based on:
      // car capacity - (fuel start of stint + fuel added from stop)

      // need to copy the ending lap # to the new stint too, but we aren't
      // storing that in the stop values yet

      this.props.createRaceStint(race.id, newStint);
    }

    // close modal
    this.toggle();
  }

  renderForm() {
    const { race, race: { stints }, activeStintId } = this.props;
    let activeDriverId = null;
    if (activeStintId) {
      activeDriverId = stints[activeStintId].driver;
    }

    return (
      <section>
        <ModalHeader toggle={this.toggle}>Pit Stop Details</ModalHeader>
        <ModalBody>
          <StopForm 
            race={race} 
            stopId={this.state.stopId} 
            activeDriverId={activeDriverId}
            onSubmit={this.handleStopSubmit.bind(this)} 
          />
        </ModalBody>

        <ModalFooter>
          <StopSubmitButton className="mr-1" />
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>
      </section>
    );
  }

  renderStopWatch() {
    return (
      <section>
        <ModalHeader 
          toggle={this.toggle}>
          <FontAwesomeIcon icon={faFlagCheckered} className="mr-2"/>
            Start Pit Stop
          </ModalHeader>
        <ModalBody>
          <div className="stop-watch text-center">
              <StopWatch 
                setStopTimerAction={click => this.sendClickToChild = click} 
                handleStop={this.handleTimerStop} 
              />
          </div>
          {this.props.children}
        </ModalBody>
        <ModalFooter>
          <Button 
            className="btn-block" 
            color="danger" 
            onClick={() => this.sendClickToChild()}>
            Stop Stopwatch
          </Button>
        </ModalFooter>
      </section>
    );
  }

  render() {
    return (
      <div>
        <Modal isOpen={this.props.isOpen} toggle={this.toggle} className={this.props.className}>
          {this.state.showTimer ? this.renderStopWatch() : this.renderForm()}
        </Modal>
      </div>
      );    
  }
}

export default StopModal = connect(null, { createRaceStop, createRaceStint })(StopModal);
