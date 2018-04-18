import _ from 'lodash';

import React, { Component } from 'react';
import { Col, FormGroup, Label, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faClock from '@fortawesome/fontawesome-free-regular/faClock';
import faPlusSquare from '@fortawesome/fontawesome-free-regular/faPlusSquare';

import moment from 'moment';
import Clock from 'react-live-clock';

import { createRaceStop, deleteRaceStop } from '../actions';

class StopWatch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentCount: 0,
      start: new moment(),
    };
  }

  componentWillMount() {
    var intervalId = setInterval(this.timer, 100);
    this.setState({ intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
    const stop = new moment();
    console.log('in stopwatch, start:', this.state.start, 'stop:', stop);
    this.props.handleTimerStop && this.props.handleTimerStop(this.state.start, stop);
  }

  timer = () => {
    this.setState({ currentCount: this.state.currentCount + 10 });
  }

  formatMilliSeconds(ms) {
    let remainderMs = (ms % 60).toString().padStart(2, "0");
    let seconds = Math.floor(ms / 60 % 60).toString().padStart(2, "0");
    let minutes = Math.floor(ms / 60 / 60 % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}:${remainderMs}`;
  }

  render() {
    return (
      <div className="digital-clock-container">
        <div className="digital-clock-ghosts">88:88:88</div>
        <div className="digital-clock">
          {this.formatMilliSeconds(this.state.currentCount)}
        </div>
      </div>
    );
  }
}

class PitStopModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen
    };
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  handleTimerStop(start, stop) {
    console.log('start:',start);
    console.log('stop:', stop);
  }

  render() {
    return (
      <div>
        <Button className="btn-block" color="danger" onClick={this.toggle}>Start Pit Stop</Button>

        <Modal isOpen={this.state.isOpen} toggle={this.toggle} className={this.props.className}>
          <ModalHeader toggle={this.toggle}>Start Pit Stop</ModalHeader>
          <ModalBody>
            <div className="h1 text-center">
                <StopWatch handleStop={this.handleTimerStop} />
            </div>
            {this.props.children}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.toggle} className="mr-1">Save</Button>
            <Button color="secondary" onClick={this.toggle}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </div>
      );    
  }
}

class RacesManage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pitStopModalOpen: false
    };

    console.log('RacesManage got race props: ', props.race);
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

  renderPitStopRow(stop) {
    return (
      <tr key={stop.id}>
        <td>{moment(stop.start).format('LTS') || '(unset)'}</td>
        <td>{stop.lap || '(unset)'}</td>
        <td>{stop.length || '(unset)'}</td>
        <td>{stop.driver || '(unset)'}</td>
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

  renderTimer() {
    return (
      <div className="digital-clock-container">
        <div className="digital-clock-ghosts">88:88:88 88</div>
        <Clock format={'h:mm:ss A'} ticking={true} className="digital-clock" />
      </div>

      );
  }

  render() {
    const { race } = this.props;
    let color = 'black';
    if (moment().isAfter(race.start)) {
      color = 'red';
    }

    return (
      <div>
        <div className="row mb-2">
          <div className="col">
            <h3>Manage {race.name}</h3>
          </div>
          <div className="col-sm-4 text-right">
            <h3>
              <div className="digital-clock-container">
                <div className="digital-clock-ghosts">88:88:88 88</div>
                <Clock format={'h:mm:ss A'} ticking={true} className={`text-${color} digital-clock`} />
              </div>
            </h3>
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
          <PitStopModal>
          </PitStopModal>
        </FormGroup>
        
        <FormGroup className="row">
          <div className="col">
            <div className="float-right">
              <Button onClick={this.handleAddStop.bind(this)}><FontAwesomeIcon icon={faPlusSquare} className="mr-1" />Add</Button>
            </div>
            <h4>Stops</h4>
            {this.renderPitStopTable()}
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

function mapStateToProps({ races }, ownProps) {
  const id = ownProps.match.params.id;
  return { race: races[id] };
}

export default connect(mapStateToProps, { createRaceStop, deleteRaceStop })(RacesManage);
