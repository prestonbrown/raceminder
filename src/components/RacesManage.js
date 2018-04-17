import _ from 'lodash';

import React, { Component } from 'react';
import { Col, FormGroup, Label, Button, Table } from 'reactstrap';
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

class RacesManage extends Component {
  constructor(props) {
    super(props);

    console.log(props.race);

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
          <FontAwesomeIcon icon={faEdit} className="mr-1" />
          <FontAwesomeIcon icon={faTrashAlt} onClick={this.handleDeleteStop.bind(this, stop.id)} />
        </td>
      </tr>
    );
  }

  render() {
    const { race } = this.props;
    let color="black";
    if (moment().isAfter(race.start)) {
      color="red";
    }

    return (
      <div>
        <div className="row mb-2">
          <div className="col">
            <h3>Manage {race.name}</h3>
          </div>
          <div className="col-sm-4 text-right">
            <div className="digital-clock-container">
              <div className="digital-clock-ghosts">88:88:88 88</div>
              <Clock format={'h:mm:ss A'} ticking={true} className={`text-${color} digital-clock`} />
            </div>
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
