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

class PitStopRow extends Component {
  render() {
    return; 
  }
}

class RacesManage extends Component {
  constructor(props) {
    super(props);

    this.race = props.race;
    console.log(this.race);

  }

  handleAddRow() {
    const data = {
      start: moment().format(),
      lap: 1,
      length: 234,
      fuel: 12.5,
      driver: 2,
      notes: "Some notes"
    }

    this.props.createRaceStop(this.race.id, data);
  }

  renderPitStopTable() {
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
          </tr>
        </thead>
        <tbody>
          {this.renderPitStopRow(null)}
        </tbody>
      </Table>
      );
  }

  renderPitStopRow(stop) {
    return (
        <tr>
          <td>TIME START</td>
          <td>LAP#</td>
          <td>LENGTH</td>
          <td>NEWDRIVER</td>
          <td>FUELREMAIN</td>
          <td>FUELIN</td>
          <td>ESTNEXTSTOPLAP</td>
          <td>NOTES</td>
        </tr>
      );
  }

  render() {
    const race = this.race;
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
              <Button onClick={this.handleAddRow.bind(this)}><FontAwesomeIcon icon={faPlusSquare} className="mr-1" />Add</Button>
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

export default connect(mapStateToProps, { createRaceStop, deleteRaceStop })(RacesManage)
