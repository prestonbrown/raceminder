import _ from 'lodash';

import React, { Component } from 'react';
import { 
  Row, Col, FormGroup, 
  Button, ButtonGroup, Table, 
  Modal, ModalHeader, ModalBody, ModalFooter 
} from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { submit } from 'redux-form';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faPlusSquare from '@fortawesome/fontawesome-free-regular/faPlusSquare';
import faFlagCheckered from '@fortawesome/fontawesome-free-solid/faFlagCheckered';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

import Clock from 'react-live-clock';

import StopForm from './StopForm';
import StintForm from './StintForm';
import StopWatch from './StopWatch';

import { createRaceStop, deleteRaceStop, createRaceStint, deleteRaceStint } from '../actions';

const STOPS = 'STOPS';
const STINTS = 'STINTS';

moment.locale('en');
momentLocalizer();

const StintSubmitButton = connect()(({ dispatch }) => (
  <Button color="primary" onClick={() => dispatch(submit('StintForm'))}>Save</Button>
  ));

const StopSubmitButton = connect()(({ dispatch }) => (
  <Button color="primary" onClick={() => dispatch(submit('StopForm'))}>Save</Button>
  ));

class StintModal extends Component {
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

StintModal = connect(null, { createRaceStint })(StintModal);

class StopModal extends Component {
  constructor(props) {
    super(props);

    console.log('stopmodal props:',props);
    this.state = {
      start: null,
      stop: null,
    };
  }

  componentDidMount() {
    console.log('stopmodal mounted, props.stopId', this.props.stopId);
  }

  toggle = () => {
    console.log('stopmodal calling this.props.onClose');
    this.props.onClose();    
  }

  handleTimerStop = (start, stop) => {
    const { race } = this.props;

    // compute stopId
    const stops = _.toArray(race.stops)
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X'));
    let stopId = 1;

    if (!_.isEmpty(stops)) {
      const lastStop = stops.slice(-1)[0];
      stopId = lastStop.id + 1;
    }

    this.props.createRaceStop(race.id, {
      start: start.format('Y-MM-DDTHH:mm:ss'),
      stop: stop.format('Y-MM-DDTHH:mm:ss')
    });

    this.setState({ start, stop, stopId });
  }

  handleStopSubmit(values) {
    console.log('stop got submitted, values:', values);
    this.props.createRaceStop(this.props.race.id, values);
    this.toggle();
  }

  renderForm() {
    return (
      <section>
        <ModalHeader toggle={this.toggle}>Pit Stop Details</ModalHeader>
        <ModalBody>
          <StopForm 
            race={this.props.race} 
            stopId={this.props.stopId} 
            activeStintId={this.props.activeStintId} 
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
        <ModalHeader toggle={this.toggle}><FontAwesomeIcon icon={faFlagCheckered} className="mr-2"/>Start Pit Stop</ModalHeader>
        <ModalBody>
          <div className="stop-watch text-center">
              <StopWatch setStopTimerAction={click => this.sendClickToChild = click} handleStop={this.handleTimerStop} />
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
        <Modal isOpen={this.props.isOpen} toggle={this.toggle} className={this.props.className}>
          {this.props.showTimer ? this.renderStopWatch() : this.renderForm()}
        </Modal>
      </div>
      );    
  }
}

StopModal = connect(null, { createRaceStop })(StopModal);

class RacesManage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stopModalOpen: false,
      viewSelected: STINTS,
      selectedStopId: null,
      selectedStintId: null,
      stintModalOpen: false
    };

    console.log('RacesManage got race props: ', props.race);
  }

  componentDidMount() {
    this.updateActiveStint(this.props);

    // refresh once a minute
    this.interval = setInterval(() => { 
      this.setState(this.state);
      // update active stint based on time
      this.updateActiveStint(this.props);
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.race.stints !== newProps.race.stints) {
      this.updateActiveStint(newProps);
    }
  }

  updateActiveStint = props => {
    const now = moment();
    _.forEach(props.race.stints, stint => {
        const end = moment(stint.end);
        const start = moment(stint.start);
        if (start < now && end > now) {
          this.setState({ activeStintId: stint.id });
          return false;
        }
      });
  }

  onViewSelected = viewSelected => {
    this.setState({ viewSelected })
  }

  handleAddStint() {
    // get stop time of last stint
    const { race } = this.props;
    const stints = _.toArray(race.stints)
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X'));
    let stintId = 1;
    let start = null;
    let end = null;

    if (!_.isEmpty(stints)) {
      const lastStint = stints.slice(-1)[0];
      stintId = lastStint.id + 1;
      start = lastStint.end;
    } else {
      start = this.props.race.start;
    }

    end = moment(start);
    end = end.add(race.stintLength ? race.stintLength : 2, 'hours').format('Y-MM-DDTHH:mm:ss');

    const data = {
      start,
      end,
      driver: null,
      notes: ''
    };

    this.props.createRaceStint(this.props.race.id, data);

    // open stint dialog to edit it
    this.setState({ stintModalOpen: true, selectedStintId: stintId });
  }

  handleDeleteStint(id) {
    this.props.deleteRaceStint(this.props.race.id, id);
    //console.log('stint ' + id + ' deleted');
  }

  handleStintModalClose = () => {
    //console.log('closing stint modal via state');
    this.setState({ stintModalOpen: false});
  }

  handleAddStop() {
    const { race } = this.props;
    const stops = _.toArray(race.stops)
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X'));
    let stopId = 1;

    if (!_.isEmpty(stops)) {
      const lastStop = stops.slice(-1)[0];
      stopId = lastStop.id + 1;
    }

    const data = {
      start: moment().format('Y-MM-DDTHH:mm:ss'),
      lap: null,
      length: null,
      fuel: null,
      driver: null,
      notes: ''
    };

    this.props.createRaceStop(this.props.race.id, data);

    // open stop dialog to edit it
    this.setState({ stintModalOpen: true, selectedStopId: stopId });
  }

  handleDeleteStop(id) {
    this.props.deleteRaceStop(this.props.race.id, id);
  }

  handleStopModalClose = () => {
    //console.log('closing stint modal via state');
    this.setState({ stopModalOpen: false});
  }


  renderStopRow(stop) {
    return (
      <tr key={stop.id} onClick={() => this.setState({ selectedStopId: stop.id, stopModalOpen: true })} style={{cursor: 'pointer'}}>
        <td>{(stop.start && moment(stop.start).format('LTS')) || '(unset)'}</td>
        <td>{stop.lap || '(unset)'}</td>
        <td>{stop.length || '(unset)'}</td>
        <td>{(stop.driver && (this.props.drivers[stop.driver].firstname + ' ' + this.props.drivers[stop.driver].lastname)) || '(unset)'}</td>
        <td>FUEL REMAINING</td>
        <td>{stop.fuel || '(unset)'}</td>
        <td>EST NEXT STOP LAP</td>
        <td>{stop.notes || ''}</td>
        <td className="text-right">
          <Button color="link"><FontAwesomeIcon icon={faTrashAlt} onClick={e => { this.handleDeleteStop(stop.id); e.stopPropagation(); }} /></Button>
        </td>
      </tr>
    );
  }

  renderStopTable() {
    const { race } = this.props;
    return (
      <Table hover responsive>
        <thead>
          <tr>
            <th scope="col">Start Time</th>
            <th scope="col">Lap #</th>
            <th scope="col">Stop Length</th>
            <th scope="col">New Driver</th>
            <th scope="col">Est. Fuel Remaining</th>
            <th scope="col">Fuel Added</th>
            <th scope="col">Est. Next Stop (Lap)</th>
            <th scope="col">Notes</th>
            <th scope="col" className="text-right"></th>
          </tr>
        </thead>
        <tbody>
          {_.map(race.stops, stop => this.renderStopRow(stop))}
        </tbody>
      </Table>
      );
  }

  renderStintRow(stint, index) {
    let after = '';
    let end = moment(stint.end);
    let start = moment(stint.start);
    let now = moment();
    if (start < now && end > now) {
      after = 'table-warning';
    } else if (end < now) {
      after = 'table-secondary';
    }

    return (
      <tr key={stint.id} className={after} onClick={() => this.setState({ selectedStintId: stint.id, stintModalOpen: true })} style={{cursor: 'pointer'}}>
        <th scope="row">{index+1}</th>
        <td>{(stint.start && moment(stint.start).format('LTS')) || '(unset)'}</td>
        <td>{stint.startingLap || '(unset)'}</td>        
        <td>{(stint.end && moment(stint.end).format('LTS')) || '(unset)'}</td>
        <td>{stint.endingLap || '(unset)'}</td>        
        <td>{(stint.driver && (this.props.drivers[stint.driver].firstname + ' ' + this.props.drivers[stint.driver].lastname)) || '(unset)'}</td>
        <td style={{ maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stint.notes || ''}</td>
        <td className="text-right">
          <Button color="link"><FontAwesomeIcon icon={faTrashAlt} onClick={e => { this.handleDeleteStint(stint.id); e.stopPropagation(); }} /></Button>
        </td>
      </tr>
    );
  }

  renderStintTable() {
    const { race } = this.props;

    // sorted stints
    let stints = _.toArray(race.stints)
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X'));
    return (
          <Table hover responsive>
            <thead className="thead-dark table-sm">
              <tr>
                <th scope="col">Stint #</th>
                <th scope="col">Start Time</th>
                <th scope="col">Starting Lap</th>
                <th scope="col">Stop Time</th>
                <th scope="col">Expected Ending Lap</th>
                <th scope="col">Driver</th>
                <th scope="col">Notes</th>
                <th scope="col" className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {_.map(stints, (stint, index) => this.renderStintRow(stint, index))}
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
    const { race, track } = this.props;
    let color = 'black';
    if (moment().isAfter(race.start)) {
      color = 'red';
    }

    return (
      <div>
        <Row className="mb-2">
          <Col>
            <h3>Manage {race.name}</h3>
            <h5>Track: {track.name}</h5>
          </Col>

          <Col>
            <img src={this.props.cars[this.props.race.car].picture} alt="Car" className="rounded" style={{maxWidth: '100px', maxHeight: '100px' }}/>
          </Col>

          <Col sm={4} className="text-right">
            <h4>
              <div className="digital-clock-container">
                <div className="digital-clock-ghosts">88:88:88 88</div>
                <Clock format={'h:mm:ss A'} ticking={true} className={`text-${color} digital-clock`} />
              </div>
            </h4>

            <FormGroup className="row">
              <Col>
                <Button tag={Link} to={`/races/${race.id}`} color="primary">Edit Race</Button>
              </Col>
            </FormGroup>
          </Col>

        </Row>


        <Row>
          <Col xs={6}>
            <strong className="mr-1">Start Time:</strong>
            {moment(race.start).format('llll')}
          </Col>
          <Col xs={6} className="text-right">
            <strong className="mr-1">End Time:</strong>
            {moment(race.end).format('llll')}
          </Col>
        </Row>

        <FormGroup>
          <Button 
            className="btn-block" 
            color="danger" 
            onClick={() => this.setState({ selectedStopId: null, stopModalOpen: true })}>
              <FontAwesomeIcon icon={faFlagCheckered} className="mr-2" />
              Start Pit Stop
          </Button>
        </FormGroup>

        <StopModal 
          race={race}
          activeStintId={this.state.activeStintId}
          stopId={this.state.selectedStopId}
          isOpen={this.state.stopModalOpen} 
          onClose={this.handleStopModalClose} />
        
        <StintModal 
          race={race} 
          stintId={this.state.selectedStintId} 
          isOpen={this.state.stintModalOpen} 
          onClose={this.handleStintModalClose} />

        <FormGroup className="row">
          <Col>
            <ButtonGroup>
              <Button 
                color="primary" 
                onClick={() => this.onViewSelected(STINTS)} 
                active={this.state.viewSelected === STINTS}
              >
                Stints
              </Button>
              <Button 
                color="primary" 
                onClick={() => this.onViewSelected(STOPS)} 
                active={this.state.viewSelected === STOPS}
              >
                Stops
              </Button>
            </ButtonGroup>
          </Col>

          <Col className="ml-auto text-right">
            <Button onClick={() => this.state.viewSelected === STOPS ? this.handleAddStop() : this.handleAddStint()}><FontAwesomeIcon icon={faPlusSquare} className="mr-1" />Add</Button>
          </Col>
        </FormGroup>

        <Row>
          <Col>
            {this.state.viewSelected === STOPS ? this.renderStopTable() : this.renderStintTable()}
          </Col>
        </Row>
      </div>
    );
  }
}

function mapStateToProps({ races, cars, drivers, tracks }, ownProps) {
  const id = ownProps.match.params.id;
  return { race: races[id], cars, drivers, track: tracks[races[id].track] };
}

export default connect(mapStateToProps, { createRaceStop, deleteRaceStop, createRaceStint, deleteRaceStint })(RacesManage);
