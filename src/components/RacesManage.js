import _ from 'lodash';

import React, { Component } from 'react';
import { 
  Col, Form, FormGroup, 
  Label, Input, Button, ButtonGroup, Table, 
  Modal, ModalHeader, ModalBody, ModalFooter 
} from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Field, reduxForm, submit } from 'redux-form';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faClock from '@fortawesome/fontawesome-free-regular/faClock';
import faPlusSquare from '@fortawesome/fontawesome-free-regular/faPlusSquare';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

import Clock from 'react-live-clock';

import PitStopForm from './PitStopForm';
import StintForm from './StintForm';

import { createRaceStop, deleteRaceStop, createRaceStint, deleteRaceStint } from '../actions';

const STOPS = 'STOPS';
const STINTS = 'STINTS';

class StopWatch extends Component {
  constructor(props) {
    super(props);

    this.start = new moment();
    this.intervalId = null;
    this.state = {
      currentMs: 0
    };
  }

  componentWillMount() {
    this.intervalId = setInterval(this.timer, 51);
  }

  componentDidMount() {
    this.props.setClickAction(this.clickAction.bind(this));
  }

  clickAction() {    
    clearInterval(this.intervalId);
    const stop = new moment();
    this.props.handleStop && this.props.handleStop(this.start, stop);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    //const stop = new moment();
    //this.props.handleStop && this.props.handleStop(this.start, stop);
  }

  timer = () => {
    this.setState({ currentMs: this.state.currentMs + 51 });
  }

  formatMilliSeconds(ms) {
    let remainderMs = Math.floor(ms / 10 % 100).toString().padStart(2, "0");
    let seconds = Math.floor(ms / 1000 % 60).toString().padStart(2, "0");
    let minutes = Math.floor(ms / 1000 / 60 % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}:${remainderMs}`;
  }

  render() {
    return (
      <div className="digital-clock-container">
        <div className="digital-clock-ghosts">88:88:88</div>
        <div className="digital-clock">
          {this.formatMilliSeconds(this.state.currentMs)}
        </div>
      </div>
    );
  }
}

const StintSubmitButton = connect()(({ dispatch }) => (
  <Button color="primary" onClick={() => dispatch(submit('StintForm'))}>Save</Button>
  ));

class StintModal extends Component {
  constructor(props) {
    super(props);

    moment.locale('en');
    momentLocalizer();
  }

  toggle = () => {
    console.log('calling this.props.onClose');
    this.props.onClose();
  }

  handleStintSubmit(values) {
    console.log('stint got submitted, values:', values);
    this.props.createRaceStint(this.props.race.id, values);
    this.toggle();
  }

  renderForm() {
    return (
      <section>
        <ModalHeader toggle={this.toggle}>Stint Details</ModalHeader>
        <ModalBody>
          <StintForm raceId={this.props.race.id} stintId={this.props.stintId} onSubmit={this.handleStintSubmit.bind(this)} />
        </ModalBody>

        <ModalFooter>
          <StintSubmitButton>
            Save
          </StintSubmitButton>
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>        
      </section>
    );
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen} toggle={this.toggle} className={this.props.className}>
        {this.renderForm()}
      </Modal>
      );    
  }
}


StintModal = connect(null, { createRaceStint })(StintModal);

class PitStopModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen,
      start: null,
      stop: null,
      stopped: false,
      stopId: null
    };

    moment.locale('en');
    momentLocalizer();

    this.handleTimerStop = this.handleTimerStop.bind(this);
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleTimerStop(start, stop) {
    const { race } = this.props;
    this.setState({ start: start, stop: stop, stopped: true, stopId: _.size(race.stops) + 1});
    this.props.createRaceStop(race.id, {
      start: start.format('Y-MM-DDTH:mm:ss'),
      stop: stop.format('Y-MM-DDTH:mm:ss')
    });
  }

  renderForm() {
    return (
      <section>
        <ModalHeader toggle={this.toggle}>Pit Stop Details</ModalHeader>
        <ModalBody>
          <PitStopForm raceId={this.props.race.id} stopId={this.state.stopId} />
        </ModalBody>
        {/*
        <ModalFooter>
          <Button type="submit" color="primary" className="mr-1">Save</Button>
          <Button color="secondary" onClick={this.toggle}>Cancel</Button>
        </ModalFooter>        
        */}
      </section>
    );
  }

  renderStopWatch() {
    return (
      <section>
        <ModalHeader toggle={this.toggle}>Start Pit Stop</ModalHeader>
        <ModalBody>
          <div className="stop-watch text-center">
              <StopWatch setClickAction={click => this.sendClickToChild = click} handleStop={this.handleTimerStop} />
          </div>
          {this.props.children}
        </ModalBody>
        <ModalFooter>
          <Button className="btn-block" color="danger" onClick={() => this.sendClickToChild()}>Stop Stopwatch</Button>
        </ModalFooter>
      </section>
    );
  }

  render() {
    return (
      <div>
        <Button className="btn-block" color="danger" onClick={this.toggle}>Start Pit Stop</Button>

        <Modal isOpen={this.state.isOpen} toggle={this.toggle} className={this.props.className}>
          {!this.state.stopped ? this.renderStopWatch() : this.renderForm()}
        </Modal>
      </div>
      );    
  }
}

PitStopModal = connect(null, { createRaceStop })(PitStopModal);

class RacesManage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pitStopModalOpen: false,
      viewSelected: STOPS,
      activeStopId: null,
      activeStintId: null,
      stintModalOpen: false
    };

    console.log('RacesManage got race props: ', props.race);
  }

  onViewSelected = viewSelected => {
    this.setState({ viewSelected })
  }

  openPitStopModal() {
    this.setState({
      pitStopModalOpen: true
    });

    console.log('asked to open modal, state now:', this.state);
  }

  handleAddStop() {
    const data = {
      start: moment().format(),
      lap: null,
      length: null,
      fuel: null,
      driver: null,
      notes: ''
    };

    this.props.createRaceStop(this.props.race.id, data);
  }

  handleDeleteStop(id) {
    this.props.deleteRaceStop(this.props.race.id, id);
  }

  handleAddStint() {
    const data = {
      start: moment().format(),
      stop: null,
      driver: null,
      notes: ''
    };

    this.props.createRaceStint(this.props.race.id, data);
  }

  handleDeleteStint(id) {
    this.props.deleteRaceStint(this.props.race.id, id);
  }

  handleStintModalClose = () => {
    console.log('closing stint modal via state');
    this.setState({ stintModalOpen: false});
  }

  renderPitStopRow(stop) {
    return (
      <tr key={stop.id}>
        <td>{moment(stop.start).format('LTS') || '(unset)'}</td>
        <td>{stop.lap || '(unset)'}</td>
        <td>{stop.length || '(unset)'}</td>
        <td>{stop.driver && (this.props.drivers[stop.driver].firstname + ' ' + this.props.drivers[stop.driver].lastname) || '(unset)'}</td>
        <td>FUEL REMAINING</td>
        <td>{stop.fuel || '(unset)'}</td>
        <td>EST NEXT STOP LAP</td>
        <td>{stop.notes || ''}</td>
        <td>
          <Button color="link"><FontAwesomeIcon icon={faEdit} /></Button>
          <Button color="link"><FontAwesomeIcon icon={faTrashAlt} onClick={this.handleDeleteStop.bind(this, stop.id)} /></Button>
        </td>
      </tr>
    );
  }

  renderPitStopTable() {
    const { race } = this.props;
    return (
      <Table striped responsive>
        <thead>
          <tr>
            <th>Start Time</th>
            <th>Lap #</th>
            <th>Stop Length</th>
            <th>New Driver</th>
            <th>Est. Fuel Remaining</th>
            <th>Fuel Added</th>
            <th>Est. Next Stop (Lap)</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {_.map(race.stops, stop => this.renderPitStopRow(stop))}
        </tbody>
      </Table>
      );
  }

  renderStintRow(stint) {
    return (
      <tr key={stint.id}>
        <td>{moment(stint.start).format('LTS') || '(unset)'}</td>
        <td>{moment(stint.stop).format('LTS') || '(unset)'}</td>
        <td>{stint.driver && (this.props.drivers[stint.driver].firstname + ' ' + this.props.drivers[stint.driver].lastname) || '(unset)'}</td>
        <td>{stint.notes || ''}</td>
        <td>
          <Button color="link" onClick={() => this.setState({ activeStintId: stint.id, stintModalOpen: true })}><FontAwesomeIcon icon={faEdit} /></Button>
          <Button color="link"><FontAwesomeIcon icon={faTrashAlt} onClick={this.handleDeleteStint.bind(this, stint.id)} /></Button>
        </td>
      </tr>
    );
  }

  renderStintTable() {
    const { race } = this.props;
    return (
      <Table striped responsive>
        <thead>
          <tr>
            <th>Start Time</th>
            <th>Stop Time</th>
            <th>Driver</th>
            <th>Notes</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {_.map(race.stints, stint => this.renderStintRow(stint))}
        </tbody>
      </Table>
      );
  }

  renderTimer() {
    return (
      <div className="digital-clock-container">
        <div className="digital-clock-ghosts">88:88:88 88</div>
        <Clock format={'h:mm:ss A'} ticking={true} className="digital-clock" />
      </div>

      );
  }

  render() {
    const { race, drivers } = this.props;
    let color = 'black';
    if (moment().isAfter(race.start)) {
      color = 'red';
    }

    return (
      <div>
        <div className="row mb-2">
          <Col>
            <h3>Manage {race.name}</h3>
          </Col>
          <Col>
            <img src={this.props.cars[this.props.race.car].picture} className="rounded" style={{maxWidth: '100px', maxHeight: '100px' }}/>
          </Col>
          <div className="col-sm-4 text-right">
            <h4>
              <div className="digital-clock-container">
                <div className="digital-clock-ghosts">88:88:88 88</div>
                <Clock format={'h:mm:ss A'} ticking={true} className={`text-${color} digital-clock`} />
              </div>
            </h4>
          </div>
        </div>


        <FormGroup className="row">
          <Label className="text-right" sm={2}>Start Time:</Label>      
          <Col sm={4}>
            <span sm={4}>{moment(race.start).format('llll')}</span>
          </Col>
          <Label className="text-right" sm={2}>End Time:</Label>
          <Col sm={4}>
            <span sm={4}>{moment(race.end).format('llll')}</span>
          </Col>
        </FormGroup>

        {/* ability to open modal */}
        <FormGroup>
          <PitStopModal race={race}>
          </PitStopModal>
        </FormGroup>
        
        <StintModal race={race} stintId={this.state.activeStintId} isOpen={this.state.stintModalOpen} onClose={this.handleStintModalClose} />

        <FormGroup className="row">
          <div className="col">
            <div className="float-right">
              <Button onClick={() => this.state.viewSelected === STOPS ? this.handleAddStop() : this.handleAddStint()}><FontAwesomeIcon icon={faPlusSquare} className="mr-1" />Add</Button>
            </div>
            <ButtonGroup>
              <Button 
                color="primary" 
                onClick={() => this.onViewSelected(STOPS)} 
                active={this.state.viewSelected === STOPS}
              >
                Stops
              </Button>
              <Button 
                color="primary" 
                onClick={() => this.onViewSelected(STINTS)} 
                active={this.state.viewSelected === STINTS}
              >
                Stints
              </Button>
            </ButtonGroup>

            {this.state.viewSelected === STOPS ? this.renderPitStopTable() : this.renderStintTable()}
          </div>
        </FormGroup>

        <FormGroup className="row">
          <Col sm={12}>
            <Button tag={Link} to={`/races/${race.id}`} color="primary">Edit Race</Button>
          </Col>
        </FormGroup>
      </div>
    );
  }
}

function mapStateToProps({ races, cars, drivers }, ownProps) {
  const id = ownProps.match.params.id;
  return { race: races[id], cars, drivers };
}

export default connect(mapStateToProps, { createRaceStop, deleteRaceStop, createRaceStint, deleteRaceStint })(RacesManage);
