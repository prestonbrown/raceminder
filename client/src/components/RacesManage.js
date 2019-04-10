import _ from 'lodash';

import React, { Component } from 'react';
import { 
  Row, Col, FormGroup, 
  Button, ButtonGroup, Table, 
  TabContent, TabPane, Nav, NavItem, NavLink
} from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { BarLoader } from 'react-spinners';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faPlusSquare from '@fortawesome/fontawesome-free-regular/faPlusSquare';
import faFlagCheckered from '@fortawesome/fontawesome-free-solid/faFlagCheckered';
import faFlag from '@fortawesome/fontawesome-free-solid/faFlag';

import moment from 'moment';
import momentLocalizer from 'react-widgets-moment';

import Clock from 'react-live-clock';

import StopModal from './StopModal';
import StintModal from './StintModal';

import { createRaceStop, deleteRaceStop, setSelectedStop,
  createRaceStint, deleteRaceStint, setSelectedStint,
  refreshRaceHero, connectRaceHeroSocket, disconnectRaceHeroSocket, 
  fetchRaceHeroLapData, clearRaceHeroData,
  connectRaceMonitorSocket, disconnectRaceMonitorSocket } from '../actions';

const STOPS = 'STOPS';
const STINTS = 'STINTS';
const LAPS = 'LAPS';

moment.locale('en');
momentLocalizer();

class RacesManage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      stopModalOpen: false,
      viewSelected: STINTS,
      stintModalOpen: false,
      flagColor: '#555',
      flag: faFlag,
      loading: true,
      activeTab: 1,
      currentLap: {}
    };

    console.log('RacesManage got race props: ', props.race);
  }

  componentDidMount() {
    if (this.props.race) {
      this.initialize(this.props);
    }
  }

  componentWillUnmount() {
    clearInterval(this.activeStintInterval);
    this.props.disconnectRaceHeroSocket(this.props.race);
    this.props.disconnectRaceMonitorSocket(this.props.race);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.race !== newProps.race) {
      this.initialize(newProps);
    }

    if (this.props.race && this.props.race.stints !== newProps.race.stints) {
      this.updateActiveStint(newProps);
    }

    /*
    if (this.props.racehero && this.props.racehero.current_lap !== newProps.racehero.current_lap) {
      this.updateActiveStint(newProps);
    }
    */
   
    if (!newProps.racehero) {
      return;
    }

    if (newProps.racehero.latest_flag) {
      let flagColor = 'green';
      let flag = faFlag;
      //console.log('latest flag color: ' + newProps.racehero.latest_flag.color);
      if (newProps.racehero.latest_flag.color === 'green') {
        flagColor = 'rgb(58,181,50)';
      } else if (newProps.racehero.latest_flag.color === 'finish' || 
        newProps.racehero.latest_flag.color == 'stop') {
        flagColor = 'white';
        flag = faFlagCheckered;
      } else {
        flagColor = newProps.racehero.latest_flag.color;
      }

      this.setState({ flagColor, flag });
    }

    if (newProps.racehero.error) {
    }
  }

  initialize(props) {
    this.updateActiveStint(props);

    //this.props.refreshRaceHero(props.race);

    if (props.race.raceHeroName) {
      this.props.connectRaceHeroSocket(props.race);
    }

    if (props.race.raceMonitorId) {
      this.props.connectRaceMonitorSocket(props.race);
    }

    // refresh once a minute
    this.activeStintInterval = setInterval(() => { 
      // update active stint based on time
      this.updateActiveStint(props);
      this.updateCurrentLap();
      // force re-render
      // this.setState(this.state);
      
    }, 10000);

    this.setState({ loading: false });
  }

  toggleTab = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  updateActiveStint = props => {
    const now = moment();
    _.forEach(props.race.stints, (carId, stints) => {
      _.forEach(stints, stint => {
          const end = moment(stint.end);
          const start = moment(stint.start);
          if (start < now && end > now) {
            this.setState({ activeStintId: stint.id });
            return false;
          }
        });
    });
  }

  onViewSelected = viewSelected => {
    this.setState({ viewSelected })
  }

  handleAddStint(carId) {
    // get stop time of last stint
    const { race } = this.props;
    //const newStintId = createStintId(race);

    // sort stints by time to figure out initial time guess
    const stints = _.toArray(race.stints[carId])
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X'));
    let start = null;
    let end = null;

    if (!_.isEmpty(stints)) {
      const lastStint = stints.slice(-1)[0];
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

    this.props.createRaceStint(this.props.race.id, carId, data);

    // open stint dialog to edit it
    this.setState({ stintModalOpen: true });
  }

  handleDeleteStint(carId, id) {
    this.props.deleteRaceStint(this.props.race.id, carId, id);
    //console.log('stint ' + id + ' deleted');
  }

  handleStintModalClose = () => {
    //console.log('closing stint modal via state');
    this.setState({ stintModalOpen: false});
  }

  handleAddStop(carId) {
    //const { race } = this.props;
    //const newStopId = createStopId(race);

    const data = {
      start: null,
      end: null,
      lap: null,
      length: null,
      fuel: null,
      driver: null,
      notes: ''
    };

    this.props.createRaceStop(this.props.race.id, carId, data);

    // open stop dialog to edit it
    this.setState({ stopModalOpen: true });
  }

  handleDeleteStop(carId, id) {
    this.props.deleteRaceStop(this.props.race.id, carId, id);
  }

  handleStopModalClose = () => {
    //console.log('closing stint modal via state');
    this.setState({ stopModalOpen: false});
  }

  estimatedStopLapByFuel(stint) {
    const { track, car } = this.props;
    let lpg = null;
    if (car.mpg) {
      lpg = car.mpg / track.length;
    }

    if (!lpg || !stint.startingLap || !stint.startingFuel) {
      return null;
    }

    const fuelAvail = stint.startingFuel - car.desiredFuelReserve;
    const maxDistance = fuelAvail * car.mpg;
    const totalLaps = Math.floor(maxDistance / track.length);
    return totalLaps + stint.startingLap;
  }

  estimatedStopLapByTime(stint) {
    const { race } = this.props;
    if (!stint.start || !stint.end || !stint.startingLap || !race.avgLapTime) {
      return null;
    }

    // in seconds, converted from milliseconds
    const stintLength = parseInt(moment(stint.end) - moment(stint.start), 10) / 1000;
    const totalLaps = Math.floor(stintLength / race.avgLapTime);
    console.log('stintLength:',stintLength,'totalLaps',totalLaps);
    return totalLaps + stint.startingLap;
  }


  renderStopRow(stop) {
    const { race } = this.props;
    const duration = stop.start && stop.end ? 
      moment(moment(stop.end).diff(moment(stop.start))).format('mm:ss') : 
      '(unset)';

    return (
      <tr 
        key={stop.id} 
        onClick={() => { this.props.setSelectedStop(race.id, stop.id); this.setState({ stopModalOpen: true }); }} 
        style={{cursor: 'pointer'}}
      >
        <td>{(stop.start && moment(stop.start).format('LTS')) || '(unset)'}</td>
        <td>{stop.lap || '(unset)'}</td>
        <td>{duration}</td>
        <td>{(stop.driver && (this.props.drivers[stop.driver].firstname + ' ' + this.props.drivers[stop.driver].lastname)) || '(unset)'}</td>
        <td>FUEL REMAINING</td>
        <td>{stop.fuel || '(unset)'}</td>
        <td>EST NEXT STOP LAP</td>
        <td>{stop.notes || ''}</td>
        <td className="text-right">
          <Button color="link" onClick={e => { this.handleDeleteStop(stop.id); e.stopPropagation(); }}>
            <FontAwesomeIcon 
              icon={faTrashAlt} 
            />
          </Button>
        </td>
      </tr>
    );
  }

  renderStopTable() {
    const { race } = this.props;
    return (
      <Table className="race-data-table" hover responsive dark>
        <thead className="table-sm">
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
    const { race, car, track } = this.props;

    let after = '';
    let end = moment(stint.end);
    let start = moment(stint.start);
    let now = moment();
    if (start < now && end > now) {
      after = 'bg-primary';
    } else if (end < now) {
      after = 'bg-secondary';
    }
    
    const currentLap = this.currentLap();
    const lapsTurned = currentLap && stint.startingLap ? currentLap - stint.startingLap : '(unset)';

    let fuelUsed = '(unknown)';
    let fuelRemaining = '(unknown)';
    if (car.mpg && stint.startingFuel && lapsTurned) {
      let distance = lapsTurned * track.length;
      fuelUsed = distance / car.mpg;
      fuelRemaining = stint.startingFuel - fuelUsed;
      if (car.desiredFuelReserve) {
        fuelRemaining = fuelRemaining - car.desiredFuelReserve;
      }
      fuelRemaining = Math.round(fuelRemaining * 10) / 10;
      fuelUsed = Math.round(fuelUsed * 10) / 10;
    }

    let stopLapByFuel = this.estimatedStopLapByFuel(stint);
    let stopLapByTime = this.estimatedStopLapByTime(stint);
    let stopLap = null;
    if (end < now) {
      stopLap = stint.endingLap ? stint.endingLap : 'unknown';
    } else {
      if (stopLapByFuel > stopLapByTime) {
        stopLap = stopLapByTime;
      } else {
        stopLap = stopLapByFuel;
      }
      if (!stopLap) stopLap = 'unknown';
    }

    return (
      <tr 
        key={stint.id} 
        className={after} 
        onClick={() => { this.props.setSelectedStint(race.id, stint.id); this.setState({ stintModalOpen: true }); }} 
        style={{cursor: 'pointer'}}
      >
        <th className="d-none d-sm-table-cell" scope="row">{index+1}</th>
        <td>{(stint.start && moment(stint.start).format('LTS')) || '(unset)'}</td>
        <td>{stint.startingLap || '(unset)'}</td>
        <td>currentLap ({lapsTurned} laps)</td>
        <td>{fuelUsed}</td>
        <td>{fuelRemaining}</td>
        <td className="d-none d-sm-table-cell">{(stint.end && moment(stint.end).format('LTS')) || '(unset)'}</td>
        <td>{stopLap}</td>        
        <td>{(stint.driver && (this.props.drivers[stint.driver].firstname + ' ' + this.props.drivers[stint.driver].lastname)) || '(unset)'}</td>
        {/*<td className="d-none d-md-table-cell" style={{ maxWidth: '500px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stint.notes || ''}</td>*/}
        <td className="text-right">
          <Button color="link">
            <FontAwesomeIcon 
              icon={faTrashAlt} 
              onClick={e => { this.handleDeleteStint(stint.id); e.stopPropagation(); }} 
            />
          </Button>
        </td>
      </tr>
    );
  }

  renderStintTable(carId) {
    const { race, cars } = this.props;

    if (!cars || !race.stints || !race.stints[carId]) {
      return null;
    }

    // sorted stints for display
    let stints = _.toArray(race.stints[carId])
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X'));
    return (
          <Table className="race-data-table" hover responsive dark>
            <thead className="table-sm" style={{ background: this.state.flagColor }}>
              <tr>
                <th className="d-none d-sm-table-cell" scope="col">Stint #</th>
                <th scope="col">Start Time</th>
                <th scope="col">Starting Lap</th>
                <th scope="col">Current Lap</th>
                <th scope="col">Est. Fuel Used</th>
                <th scope="col">Est. Fuel Remaining</th>
                <th className="d-none d-sm-table-cell" scope="col">Stop Time</th>
                <th scope="col">Ending Lap <br/>(or Best Est.)</th>
                <th scope="col">Driver</th>
                {/*<th className="d-none d-md-table-cell" scope="col">Notes</th>*/}
                <th scope="col" className="text-right"></th>
              </tr>
            </thead>
            <tbody>
              {_.map(stints, (stint, index) => this.renderStintRow(stint, index))}
            </tbody>
          </Table>
      );
  }

  renderLapRow(data, index) {
    let formatSeconds = function(secThousanths) {
      return secThousanths / 1000;
    }

    return (
      <tr 
        key={data[0] + '-' + data[1] + '-' + data[2]} 
        style={{cursor: 'pointer'}}
      >
        <th className="d-none d-sm-table-cell" scope="row">{data[0]}</th>
        <td>{data[1]}</td>        
        <td>{formatSeconds(data[2])}</td>
        <td>{data[4]}</td>
      </tr>
    );    
  }

  renderLapsTable(carId) {
    const { race, cars } = this.props;
    const { racehero } = this.props;

    if (!racehero) {
      return 'No Live Data';
    }    

    const sessionId = this.currentSessionId(carId);
    const lapData = this.sessionLapData(sessionId);
    //console.log('lap data for racer ' + sessionId + ':', lapData);

    return (
      <Table className="race-laps-table" hover responsive dark>
        <thead className="table-sm">
          <tr>
            <th scope="col">Lap #</th>
            <th scope="col">Position</th>
            <th scope="col">Time</th>
            <th scope="col">Condition</th>
          </tr>
        </thead>
        <tbody>
          {_.map(lapData, (data, index) => this.renderLapRow(data, index))}
        </tbody>
      </Table>
    );
  }

  updateCurrentLap() {
    const { race, racehero, racemonitor, cars } = this.props;

    if (!cars) {
      return null;
    }

    if ((!racehero || !racehero.racer_sessions) && (!racemonitor || !racemonitor.laps)) {
      return 'No Live Data';
    }    

    _.map(race.cars, carId => {
      if (racehero) {
        const data = _.find(racehero.racer_sessions, s => s.racer_number.toUpperCase() === cars[carId].number.toUpperCase());
        //console.log('got racehero data for car ',carNumber,':',data);

        if (data && racehero.passings && data.racer_session_id) {
          const passings = _.find(racehero.passings, p => p.racer_session_id === data.racer_session_id);
          //console.log('passings for ' + data.name, passings);
          if (this.state.currentLap[carId] !== passings.current_lap) {
            let currentLap = {...this.state.currentLap};
            currentLap[carId] = passings.current_lap;
            this.setState({ currentLap });
            this.props.fetchRaceHeroLapData(race, data.racer_session_id);
          }
        }
      } else if (racemonitor) {
        const data = racemonitor.laps[cars[carId].number];
        if (data) {
          if (this.state.currentLap[carId] !== data.lap) {
            let currentLap = {...this.state.currentLap};
            currentLap[carId] = data.lap;
            this.setState({ currentLap });
          }
        }
      }
    });


    //return 'Unknown';
  }

  currentPosition(carId) {
    const { racehero, racemonitor, cars } = this.props;

    if (!cars) {
      return null;
    }

    if ((!racehero || !racehero.racer_sessions) && (!racemonitor || !racemonitor.laps)) {
      return 'No Live Data';
    }  

    if (racehero) {
      const data = _.find(racehero.racer_sessions, s => s.racer_number.toUpperCase() === cars[carId].number.toUpperCase());
      //console.log('got racehero data for car ',car.number,':',data);

      if (data && racehero.passings && data.racer_session_id) {
        const passings = _.find(racehero.passings, p => p.racer_session_id === data.racer_session_id);
        return passings.position_in_class;
      }
    } else if (racemonitor) {
      const data = racemonitor.laps[cars[carId].number];
      if (data) {
        return data.position;
      }
    }

    return 'Unknown';
  }    
  
  currentDriverName(carId) {
    const { racehero, racemonitor, cars } = this.props;

    if (!cars) {
      return null;
    }

    if ((!racehero || !racehero.racer_sessions) && (!racemonitor || !racemonitor.laps)) {
      return 'No Live Data';
    }  

    if (racehero) {
      const data = _.find(racehero.racer_sessions, s => s.racer_number.toUpperCase() === cars[carId].number.toUpperCase());
      //console.log('got racehero data for car ',car.number,':',data);

      if (data && data.name) {
        return data.name;
      }
    }

    return 'Unknown';
  }        

  /**
   * Given a RaceMinder car ID, get racehero session ID for that car, based on comparing car numbers.
   */
  currentSessionId(carId) {
    const { racehero, racemonitor, cars } = this.props;

    if (!cars) {
      return null;
    }

    if ((!racehero || !racehero.racer_sessions) && (!racemonitor || !racemonitor.laps)) {
      return null;
    }  

    const data = _.find(racehero.racer_sessions, s => s.racer_number.toUpperCase() === cars[carId].number.toUpperCase());
    //console.log('got racehero data for car ',car.number,':',data);

    if (data && data.name) {
      return data.racer_session_id;
    }

    return null;
  }        

  /**
   * Given a RaceMinder driver ID, get session information for that driver, based on comparing driver names.
   */
  sessionInfoForDriver(driverId) {
    const { race, drivers, racehero } = this.props;

    if (!race || !racehero) {
      return null;
    }

    const driver = drivers[driverId];
    if (!driver) {
      return null;
    }

    // look up racehero driver id.
    if (racehero.racer_sessions) {
      const session = _.find(racehero.racer_sessions, 
        s => { 
          //console.log('session driver name: ' + s.name.toUpperCase() + '; driver name: ' + (driver.firstname + ' ' + driver.lastname).toUpperCase());
          return s.name.toUpperCase() === (driver.firstname + ' ' + driver.lastname).toUpperCase();
      });
      if (!session) {
        return null;
      }
      return session;
    }

    return null;
  }

  driverLapData(driverId) {
    const { race, racehero } = this.props;

    if (!race || !racehero) {
      return null;
    }

    const session = this.sessionInfoForDriver(driverId);
    if (!session) {
      return null;
    }

    const sessionId = session.racer_session_id;
    if (!racehero.laps || !racehero.laps[sessionId]) {
      return null;
    }

    return racehero.laps[sessionId];
  }

  allDriverLapData() {
    const { race } = this.props;
    if (!race) {
      return null;
    }
    return _.map(race.drivers, driverId => this.driverLapData(driverId));
  }

  sessionLapData(sessionId) {
    const { racehero } = this.props;
    if (!racehero || !racehero.laps[sessionId]) {
      return null;
    }
    return racehero.laps[sessionId];
  }


  allCarLapData(carId) {
    const { race, racehero, cars } = this.props;
    if (!race || !racehero || !cars) {
      return null;
    }
    const car = cars[carId];

    const carSessions = _.filter(racehero.racer_sessions, s => s.racer_number.toUpperCase() === car.number.toUpperCase());
    const carSessionIds = _.map(carSessions, s => s.racer_session_id);
    const allLapData = [];
    for (const sessionId of carSessionIds) {
      allLapData.push(this.sessionLapData(sessionId));
    }
    return allLapData;
  }

  lastLapTime(carId) {
    const { racehero, racemonitor, cars } = this.props;

    if (!cars) {
      return null;
    }

    if ((!racehero || !racehero.racer_sessions) && (!racemonitor || !racemonitor.laps)) {
      return 'No Live Data';
    }  

    if (racehero) {
      const data = _.find(racehero.racer_sessions, s => s.racer_number.toUpperCase() === cars[carId].number.toUpperCase());
      //console.log('got racehero data for car ',carNumber,':',data);

      if (data && racehero.passings && data.racer_session_id) {
        const passings = _.find(racehero.passings, p => p.racer_session_id === data.racer_session_id);

        const lapTime = moment(passings.last_lap_time_seconds * 1000).format('mm:ss.SS');
        return lapTime;
        //return passings.last_lap_time;
      }
    } else if (racemonitor) {
      const data = racemonitor.laps[cars[carId].number];
      if (data) {
        return data.lapTime;
      }
    }
    return 'Unknown';
  }

  remainingLapsByFuel() {
  }

  remainingLapsByTime() {
    const { race } = this.props;

    if (!this.state.activeStintId) {
      return 0;
    }
    //const activeStint = race.stints[this.state.activeStintId];
  }

  renderDriverStuff() {
    const { race, drivers } = this.props;
    const raceDrivers = _.map(race.drivers, driverId => drivers[driverId]);
    const driverNames = [];
    for (const driver of raceDrivers) {
      console.log('driver ' + driver.firstname + ' ' + driver.lastname + ' average lap time: ' + Math.round(this.driverAvgLapTime(driver.id) * 1000) / 1000);
    }
  }

  driverAvgLapTime(driverId) {
    let sessionInfo = this.sessionInfoForDriver(driverId);
    //console.log('driver id',driverId,'avg lap time session info:',sessionInfo);
    let laps = this.driverLapData(driverId);
    if (!laps) {
      return null;
    }

    let sum = laps.map(lap => lap[2]).reduce((prev, cur) => { 
      return prev + cur;
    });

    return laps.length > 0 ? sum / (laps.length - 1) / 1000 : sum / 1000; // skip 0 (on grid) lap
  }

  renderTabs() {
    const { race, cars } = this.props;

    let navs = _.map(race.cars, (carId, index) => {
      const car = cars && cars[carId] ? cars[carId] : null;

      if (!car) {
        console.log('no car found for id:',carId);
        console.log('cars:',cars);
        return null;
      }
          
      return (
        <NavItem key={carId}>
          <NavLink className={this.state.activeTab == index+1 ? 'active' : ''}
            onClick={() => { this.toggleTab(index+1); }}
            >
            {`${car.name} #${car.number}`}
          </NavLink>
        </NavItem>
        );
      });

    return [
      navs,
      <NavItem key="driversTab">
        <NavLink className={this.state.activeTab == race.cars.length+1 ? 'active' : ''}
          onClick={() => { this.toggleTab(race.cars.length+1); }}
          >
          Driver Stats
        </NavLink>
      </NavItem>
    ];
  }

  renderTabContent() {
    const { race, cars } = this.props;

    let carContent = _.map(race.cars, (carId, index) => {
      const car = cars && cars[carId] ? cars[carId] : null;

      if (!car) {
        return null;
      }
      
      return (
        <TabPane key={carId} tabId={index+1}>
          <Row className="mb-2">
            <Col>
              <img 
                src={car.picture} 
                alt="Car" 
                className="rounded mb-1"
                style={{maxWidth: '100px', maxHeight: '100px' }}
              />
            </Col>

            { race &&
            <Col>
              <div>
                <strong>Current Driver: </strong>
                {this.currentDriverName(car.id)}
              </div>

              <div>
                <strong className="mr-1">Position In Class: </strong>
                {this.currentPosition(car.id)}
              </div>
            </Col>
            }

            { race &&
            <Col> 
              <div>
                <strong>Current Lap: </strong>
                {this.state.currentLap[car.id]}
              </div>

              <div>
                <strong>Last Lap Time: </strong>
                {this.lastLapTime(car.id)}
              </div>
            </Col>
            }
          </Row>

          <FormGroup className="row">
            <Col>
              <ButtonGroup>
                <Button 
                  color="primary" 
                  onClick={() => this.onViewSelected(STINTS)} 
                  active={this.state.viewSelected === STINTS}>
                  Stints
                </Button>
                <Button 
                  color="primary" 
                  onClick={() => this.onViewSelected(STOPS)} 
                  active={this.state.viewSelected === STOPS}>
                  Stops
                </Button>
                <Button 
                  color="secondary" 
                  onClick={() => this.onViewSelected(LAPS)} 
                  active={this.state.viewSelected === LAPS}>
                  Laps
                </Button>
              </ButtonGroup>
            </Col>

            <Col className="ml-auto text-right">
              {this.state.viewSelected === STINTS &&
                <Button onClick={() => this.handleAddStint()}>
                  <FontAwesomeIcon icon={faPlusSquare} className="mr-1" />
                  Add
                </Button>
              }
            </Col>
          </FormGroup>

          <Row>
            <Col>
              {
                (() => {
                  switch(this.state.viewSelected) {
                    case STOPS: return this.renderStopTable(car.id); break;
                    case STINTS: return this.renderStintTable(car.id); break;
                    case LAPS: return this.renderLapsTable(car.id); break;
                  }
                })()
              }
            </Col>
          </Row>
        </TabPane>
      );
    });

    return [
      carContent,
      <TabPane key="driversTabContent" tabId={race.cars.length+1}>
        <Row className="mb-2">
          <Col>
            {this.renderDriverStuff()}
          </Col>
        </Row>
      </TabPane>
    ];
  }

  renderHeader() {
    const { race, cars, track, racehero, racemonitor } = this.props;

    if (!race) {
      return null;
    }

    /*
    const remLaps = this.remainingLapsByTime();
    console.log('remaining laps:', remLaps);
    */
   
    let color = this.state.flagColor;
    if (moment().isAfter(race.end)) {
      color = 'secondary';
    }

    return (
      <div>
        <Row className="mb-2 text-light">
          <Col xs={5}>
            <h3>{race.name}</h3>
            <h5 className="d-none d-md-block">Track: {track.name}</h5>
            {racehero &&
              <h5 className="d-none d-md-block">Lead Lap: {racehero.current_lap}</h5>
            }
          </Col>

          <Col xs={1}>
              <FontAwesomeIcon icon={this.state.flag} style={{ fontSize: '48px', color, filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.5))' }} />
          </Col>

          <Col xs={2}>
            <strong>Live Data: </strong>
            { (racemonitor || (racehero && !racehero.error)) ? 
              <div className="text-info">CONNECTED</div>
              :
              <div className="text-warning">DISCONNECTED</div>
            }
          </Col>

          <Col className="ml-auto text-right">
            <FormGroup className="row">
              <Col>
                <Button tag={Link} to={`/races/${race.id}`} color="primary">Edit Race</Button>
                <Button onClick={() => this.props.clearRaceHeroData(race) } className="ml-1">Clear RaceHero</Button>
              </Col>
            </FormGroup>

            <h4 className="time-of-day">
              <div className="digital-clock-container">
                <div className="digital-clock-ghosts">88:88:88 88</div>
                <Clock format={'h:mm:ss A'} ticking={true} className={`text-${color} digital-clock`} />
              </div>
            </h4>

          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            <strong className="mr-1">Scheduled Start:</strong>
            {moment(race.start).format('llll')}
          </Col>
          <Col xs={6} className="text-right">
            <strong className="mr-1">Scheduled End:</strong>
            {moment(race.end).format('llll')}
          </Col>
        </Row>

        <Row className="mb-2">
          <Col>
            <FormGroup>
              <Button 
                className="btn-block btn-lg" 
                color="danger" 
                onClick={() => { this.props.setSelectedStop(race.id, null); this.setState({ stopModalOpen: true }); }}>
                  <FontAwesomeIcon icon={faFlagCheckered} className="mr-2" />
                  Start Pit Stop
              </Button>
            </FormGroup>
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { race, cars, track, racehero, racemonitor } = this.props;
   
    if (this.state.loading) {
      return(
        <div style={{position: 'fixed', top: '50%', left: '50%', marginLeft: '-50px' }}>
          <BarLoader color={'#123abc'} loading={this.state.loading} />      
        </div>
        );
    }    

    return (
      <div>
        {this.renderHeader()}
        
        <Row className="mb-2">
          <Col xs={12}>
            <Nav tabs className="bg-light text-dark p-2">
              {this.renderTabs()}
            </Nav>

            <TabContent activeTab={this.state.activeTab} className="bg-light text-dark p-2">
              {this.renderTabContent()}
            </TabContent>
          </Col>
        </Row>

        <StopModal 
          race={race}
          stopId={race.selectedStopId}
          activeStintId={this.state.activeStintId}
          isOpen={this.state.stopModalOpen} 
          onClose={this.handleStopModalClose} />
        
        <StintModal 
          race={race} 
          stintId={race.selectedStintId} 
          activeStintId={this.state.activeStintId}
          isOpen={this.state.stintModalOpen} 
          onClose={this.handleStintModalClose} />

      </div>
    );
  }
}

function mapStateToProps({ races, cars, drivers, tracks, externalData }, ownProps) {
  const id = ownProps.match.params.id;
  return { 
    drivers, 
    race: races[id], 
    cars: cars,
    track: tracks && races[id] ? tracks[races[id].track] : null,
    racehero: externalData && externalData.racehero ? externalData.racehero[id] : null,
    racemonitor: externalData.racemonitor ? externalData.racemonitor[id] : null
  };
}

export default connect(mapStateToProps, { 
  createRaceStop, 
  deleteRaceStop, 
  setSelectedStop,
  createRaceStint, 
  deleteRaceStint,
  setSelectedStint,
  refreshRaceHero,
  connectRaceHeroSocket,
  disconnectRaceHeroSocket,
  fetchRaceHeroLapData,
  clearRaceHeroData,
  connectRaceMonitorSocket,
  disconnectRaceMonitorSocket
})(RacesManage);
