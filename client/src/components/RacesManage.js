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
      viewSelected: LAPS,
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
    this.activeStintInterval = null;
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

    // check here if laps have changed and update render accordingly...

    if (newProps.racehero.latest_flag) {
      let flagColor = 'green';
      let flag = faFlag;
      //console.log('latest flag color: ' + newProps.racehero.latest_flag.color);
      if (newProps.racehero.latest_flag.color === 'green') {
        flagColor = 'rgb(58,181,50)';
      } else if (newProps.racehero.latest_flag.color === 'finish' || 
        newProps.racehero.latest_flag.color === 'stop') {
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
    if (this.activeStintInterval) {
      clearInterval(this.activeStateInterval);
      this.activeStateInterval = null;
    }

    this.updateActiveStint(props);

    if (props.race.raceHeroName) {
      this.props.connectRaceHeroSocket(props.race);
    }

    if (props.race.raceMonitorId) {
      this.props.connectRaceMonitorSocket(props.race);
    }

    // set active car
    this.setState({ selectedCarId: props.race.cars[0]});

    // refresh once a minute
    this.activeStintInterval = setInterval(() => { 
      // update active stint based on time
      this.updateActiveStint(props);
      this.updateLaps();
      // force re-render
      // this.setState(this.state);
      
    }, 10000);

    this.setState({ loading: false });
  }

  toggleTab = (tab, carId = null) => {
    if (this.state.activeTab !== tab) {
      let newState = { activeTab: tab };
      if (carId) {
        newState.selectedCarId = carId;
      }
      this.setState(newState);
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
    const stints = race.stints && race.stints[carId] ? _.toArray(race.stints[carId])
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X')) : [];
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

    /*
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
    */

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

  estimatedStopLapByFuel(carId, stint) {
    const { track, cars } = this.props;
    const car = cars[carId];
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

  estimatedStopLapByTime(carId, stint) {
    const { race, cars } = this.props;
    //const car = cars[carId];
    if (!stint.start || !stint.end || !stint.startingLap || !race.avgLapTime) {
      return null;
    }

    // in seconds, converted from milliseconds
    const stintLength = parseInt(moment(stint.end) - moment(stint.start), 10) / 1000;
    const totalLaps = Math.floor(stintLength / race.avgLapTime);
    console.log('stintLength:',stintLength,'totalLaps',totalLaps);
    return totalLaps + stint.startingLap;
  }


  renderStopRow(carId, stop) {
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
          <Button color="link" onClick={e => { this.handleDeleteStop(carId, stop.id); e.stopPropagation(); }}>
            <FontAwesomeIcon 
              icon={faTrashAlt} 
            />
          </Button>
        </td>
      </tr>
    );
  }

  renderStopTable(carId) {
    const { race } = this.props;

    if (!race) {
      return;
    }

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
          {race.stops && race.stops[carId] ? _.map(race.stops[carId], stop => this.renderStopRow(carId, stop)) : null}
        </tbody>
      </Table>
      );
  }

  renderStintRow(stint, carId, index) {
    const { race, cars, track } = this.props;

    const car = cars[carId];

    let after = '';
    let end = moment(stint.end);
    let start = moment(stint.start);
    let now = moment();
    if (start < now && end > now) {
      after = 'bg-primary';
    } else if (end < now) {
      after = 'bg-secondary';
    }
    
    const currentLap = this.state.currentLap[carId] || null;
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

    let stopLapByFuel = this.estimatedStopLapByFuel(carId, stint);
    let stopLapByTime = this.estimatedStopLapByTime(carId, stint);
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
        onClick={() => { this.props.setSelectedStint(race.id, carId, stint.id); this.setState({ stintModalOpen: true }); }} 
        style={{cursor: 'pointer'}}
      >
        <th className="d-none d-sm-table-cell" scope="row">{index+1}</th>
        <td>{(stint.start && moment(stint.start).format('LTS')) || '(unset)'}</td>
        <td>{Number.isInteger(stint.startingLap) ? stint.startingLap : '(unset)'}</td>
        <td>{currentLap || 'unknown'} ({lapsTurned} laps)</td>
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
              onClick={e => { this.handleDeleteStint(carId, stint.id); e.stopPropagation(); }} 
            />
          </Button>
        </td>
      </tr>
    );
  }

  renderStintTable(carId) {
    const { race } = this.props;

    if (!race) {
      return;
    }
    // sorted stints for display
    let stints = race.stints && race.stints[carId] ? _.toArray(race.stints[carId])
      .sort((a, b) => moment(a.start).format('X') - moment(b.start).format('X')) : [];
    return (
          <Table className="race-data-table" hover responsive dark>
            <thead className="table-sm">
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
              {_.map(stints, (stint, index) => this.renderStintRow(stint, carId, index))}
            </tbody>
          </Table>
      );
  }

  renderLapRow(data, carId, index) {
    let formatSeconds = function(secThousanths) {
      return secThousanths / 1000;
    }

    return (
      <tr 
        key={data[0] + '-' + data[1] + '-' + data[2]}
        style={{cursor: 'pointer', color: data[4] === 'G' ? 'var(--green)' : (data[4] === 'Y' ? 'var(--yellow)' : 'inherit')}}
      >
        <th className="d-none d-sm-table-cell" scope="row">{data[0]}</th>
        <td>{data[1]}</td>        
        <td>{formatSeconds(data[2])}</td>
        <td>{data[4]}</td>
      </tr>
    );    
  }

  renderLapsTable(carId) {
    const { racehero } = this.props;

    if (!racehero) {
      return 'No Live Data';
    }    

    const session = this.currentSession(carId);
    let lapData = [];
    if (session) {
      lapData = this.sessionLapData(session.racer_session_id);
    } 
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
          {_.map(lapData, (data, index) => this.renderLapRow(data, carId, index))}
        </tbody>
      </Table>
    );
  }

  /***************************************************************************/

  /**
   * return all session data.
   */
  allSessions() {
    const { racehero } = this.props;

    if (!racehero) {
      return {};
    }

    return racehero.racer_sessions;
  }

  /**
   * Given a RaceMinder car ID, get racehero session for that car, based on comparing car numbers.
   */
  currentSession(carId) {
    const { racehero, cars } = this.props;

    if (!cars || !racehero || !racehero.racer_sessions) {
      return null;
    }  

    const car = cars[carId];
    if (!car) {
      return null;
    }

    // get session by comparing race car numbers
    const session = _.findLast(racehero.racer_sessions, s => s.racer_number.toUpperCase() === car.number.toUpperCase());
    //console.log('got racehero data for car ',car.number,':',data);

    return session || null;
  }

  /**
   * Return the current RaceMinder driver data object.
   */
  currentDriver(carId) {
    const { race, drivers } = this.props;

    if (!race || !drivers) {
      return null;
    }

    // find current session by car ID.
    const session = this.currentSession(carId);
    //console.log('got racehero data for car ',car.number,':',data);

    if (session) {
      const raceDrivers = _.map(race.drivers, id => drivers[id]);

      // now match session driver name to any valid drivers of the car
      return _.find(raceDrivers, d => (this.driverName(d, true) === session.name.toUpperCase()));
    }

    return null;
  }        

  /**
   * Given a RaceMinder car ID, get the last passing data for that car.
   */
  currentPassingData(carId) {
    const { racehero, cars } = this.props;

    if (!cars || !racehero || !racehero.racer_sessions) {
      return null;
    }  

    const session = this.currentSession(carId);

    if (session && racehero.passings) {
      return racehero.passings[session.racer_session_id];
    }

    return null;
  }

  /**
   * Given a RaceMinder car ID, return the current position of the car.
   */
  currentPosition(carId) {
    const data = this.currentPassingData(carId);
    if (data) {
      return data.position_in_class;
    }

    return null;
  }    

  /**
   * Given a RaceMinder car ID, return the last lap time for that car.
   */
  lastLapTime(carId) {
    const data = this.currentPassingData(carId);
    if (data) {
      return moment(data.last_lap_time_seconds * 1000).format('mm:ss.SS');
    }

    return null;
  }

  /**
   * Update lap information for all cars belonging to the
   * race object
   */
  updateLaps() {
    const { race, cars, racehero } = this.props;

    if (!race || !cars || !racehero) {
      return;
    }

    _.map(race.cars, carId => {
      const session = this.currentSession(carId);

      if (!session) {
        console.log('no session for car ' + carId);
        return;
      }

      const data = this.currentPassingData(session.racer_session_id);
      if (!data && racehero.live_run_id) {
        this.props.fetchRaceHeroLapData(race, session.racer_session_id);
        return;
      }

      if (data && this.state.currentLap[carId] !== data.current_lap) {
        console.log('old lap for car ' + carId + ': ' + this.state.currentLap[carId] + 
          '; new lap: ' + data.current_lap)
        let currentLap = {...this.state.currentLap};
        currentLap[carId] = data.current_lap;
        this.setState({ currentLap });

        // if current lap of session has changed, we need to get fresh lap data for that session.
        this.props.fetchRaceHeroLapData(race, session.racer_session_id);
      }
    });
  }

  /**
   * Get the RaceMinder driver object for a driver id
   */
  getDriver(driverId) {
    const { race, drivers } = this.props;

    if (!race || !drivers) {
      return null;
    }

    return drivers[driverId] || null;
  }

  /**
   * Given a RaceMinder driver object, return the driver's full name.
   */
  driverName(driver, uppercase = false) {
    let name = driver.firstname + ' ' + driver.lastname;
    if (uppercase) {
      return name.toUpperCase();
    } else {
      return name;
    }
  }

  /**
   * Given a RaceMinder driver, get ALL session information for that driver, 
   * based on comparing driver names.
   */
  sessionsForDriver(driverId) {
    const { race, racehero } = this.props;

    if (!race || !racehero) {
      return [];
    }

    const driver = this.getDriver(driverId);
    if (!driver) {
      return [];
    }
    
    // look up racehero sessions by driver name (first and last).
    if (racehero.racer_sessions) {
      return _.filter(racehero.racer_sessions, s => this.driverName(driver, true) === s.name.toUpperCase());
    }

    return [];
  }

  /**
   * Return array of lap data (also an array) with indices being
   * the session IDs of those laps.  If a driver has driven in 
   * multiple sessions, multiple lap data arrays are possible / expected.
   * If a car ID is provided, filter sessions so only those for the car
   * are returned.
   */
  driverLapData(driverId, carId = null) {
    const { race, cars, racehero } = this.props;

    if (!race || (carId && !cars) || !racehero || !racehero.laps) {
      return [];
    }

    let sessions = this.sessionsForDriver(driverId);
    if (!sessions.length) {
      return [];
    }

    if (carId) {
      const car = cars[carId];
      const carNum = car.number.toUpperCase();

      sessions = _.filter(sessions, s => s.racer_number.toUpperCase() === carNum);
    }

    // first make a collection for each session id.
    let laps = [];
    for (const session of sessions) {
      if (racehero.laps[session.racer_session_id]) {
        laps = _.merge(laps, racehero.laps[session.racer_session_id]);
      }
    }

    /*
    console.log(sessions);
    console.log('found laps: ', laps);
    */
   
    return laps;
  }

  driverNameLapData(name) {
    const { racehero } = this.props;

    if (!racehero || !racehero.laps) {
      return [];
    }

    let sessions = this.allSessions();
    sessions = _.filter(sessions, s => s.name.toUpperCase() === name.toUpperCase());

    let laps = [];
    for (const session of sessions) {
      if (racehero.laps[session.racer_session_id]) {
        laps = _.merge(laps, racehero.laps[session.racer_session_id]);
      }
    }

    return laps;
  }

  /**
   * If we have lap data for a particular Racehero session Id, retrieve it.
   */
  sessionLapData(sessionId) {
    const { racehero } = this.props;

    if (!racehero || !racehero.laps) {
      return [];
    }

    return racehero.laps[sessionId] || [];
  }

  allDriversLapData() {
    const { race } = this.props;
    if (!race) {
      return [];
    }
    return _.map(race.drivers, driverId => this.driverLapData(driverId));
  }

  allCarLapData(carId) {
    const { race, racehero, cars } = this.props;
    if (!race || !racehero || !cars) {
      return [];
    }
    const car = cars[carId];

    const carSessions = _.filter(racehero.racer_sessions, s => s.racer_number.toUpperCase() === car.number.toUpperCase());
    const carSessionIds = _.map(carSessions, s => s.racer_session_id);
    let allLapData = [];
    for (const sessionId of carSessionIds) {
      allLapData.push(this.sessionLapData(sessionId));
    }

    return allLapData;
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
    const { race, racehero, drivers } = this.props;
    const raceDrivers = _.map(race.drivers, driverId => drivers[driverId]);

    if (!racehero) {
      return;
    }
    
    const moreDrivers = _.map(this.allSessions(), s => 
      <div key={"driver_info_"+s.racer_session_id}>
        <h3>
          {s.name}
        </h3>
        <div>
          Average Lap Time: {this.driverNameAvgLapTime(s.name)}
        </div>
      </div>
      );

    return [
      _.map(raceDrivers, d => 
      <div key={"driver_info_"+d.id}>
        <h3>
          {this.driverName(d)}
        </h3>
        <div>
          Average Lap Time: {this.driverAvgLapTime(d.id)}
        </div>
      </div>
      ),
      moreDrivers,
    ];
  }

  /**
   * Given a RaceMinder driver ID or a driver name, and optional Car ID, get the average 
   * lap time(s) (for all applicable sessions) for that driver.
   */
  driverAvgLapTime(driverId, carId = null) {
    let laps = this.driverLapData(driverId, carId);
    if (!laps.length) {
      return null;
    }

    let sum = _.map(laps, l => l[2]).reduce((prev, cur) => prev + cur);

    let avg = (laps.length > 0 ? sum / (laps.length - 1) : sum);
    return moment(avg).format('mm:ss.SS');
  }

  driverNameAvgLapTime(name) {
    let laps = this.driverNameLapData(name);
    if (!laps.length) {
      return null;
    }

    let sum = _.map(laps, l => l[2]).reduce((prev, cur) => prev + cur);
    let avg = (laps.length > 0 ? sum / (laps.length - 1) : sum);
    return moment(avg).format('mm:ss.SS');
  }

  renderTabs() {
    const { race, cars } = this.props;

    let navs = _.map(race.cars, (carId, index) => {
      const car = cars && cars[carId] ? cars[carId] : null;

      if (!car) {
        return null;
      }
          
      return (
        <NavItem key={carId}>
          <NavLink className={this.state.activeTab === index+1 ? 'active' : ''}
            onClick={() => { this.toggleTab(index+1, carId); }}
            >
            {`${car.name} #${car.number}`}
          </NavLink>
        </NavItem>
        );
      });

    return [
      navs,
      <NavItem key="driversTab">
        <NavLink className={this.state.activeTab === race.cars.length+1 ? 'active' : ''}
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

            { race && this.currentDriver(car.id) &&
            <Col>
              <div>
                <strong>Current Driver: </strong>
                {this.driverName(this.currentDriver(car.id))}
              </div>

              <div>
                <strong className="mr-1">Position In Class: </strong>
                {this.currentPosition(car.id)}
              </div>
            </Col>
            }

            { race && this.currentDriver(car.id) &&
            <Col> 
              <div>
                <strong>Current Lap: </strong>
                {this.state.currentLap[car.id] || 'N/A'}
              </div>

              <div>
                <strong>Last Lap Time: </strong>
                {this.lastLapTime(car.id)}
              </div>

              <div>
                <strong>Average Lap Time: </strong>
                {this.driverAvgLapTime(this.currentDriver(car.id).id)}
              </div>
            </Col>
            }
          </Row>

          <FormGroup className="row">
            <Col>
              <ButtonGroup>
                <Button 
                  onClick={() => this.onViewSelected(LAPS)} 
                  active={this.state.viewSelected === LAPS}>
                  Laps
                </Button>
                <Button 
                  onClick={() => this.onViewSelected(STINTS)} 
                  active={this.state.viewSelected === STINTS}>
                  Stints
                </Button>
                <Button 
                  onClick={() => this.onViewSelected(STOPS)} 
                  active={this.state.viewSelected === STOPS}>
                  Stops
                </Button>
              </ButtonGroup>
            </Col>

            <Col className="ml-auto text-right">
              {this.state.viewSelected === STINTS &&
                <Button key="addStint" color="primary" onClick={() => this.handleAddStint(car.id)}>
                  <FontAwesomeIcon icon={faPlusSquare} className="mr-1" />
                  Add
                </Button>
              }
              {this.state.viewSelected === STOPS &&
                <Button key="addStop" color="primary" onClick={() => this.handleAddStop(car.id)}>
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
                    case STOPS: 
                    return this.renderStopTable(car.id); 
                    break;
                    case STINTS: 
                    return this.renderStintTable(car.id); 
                    break;
                    case LAPS: 
                    default: 
                    return this.renderLapsTable(car.id); 
                    break;
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
    const { race, track, racehero, racemonitor } = this.props;

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
    const { race, cars } = this.props;
   
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
          cars={cars}
          stopId={race.selectedStopId}
          carId={this.state.selectedCarId}
          activeStintId={this.state.activeStintId}
          isOpen={this.state.stopModalOpen} 
          onClose={this.handleStopModalClose} />
        
        <StintModal 
          race={race}
          cars={cars} 
          stintId={race.selectedStintId} 
          carId={this.state.selectedCarId}
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
