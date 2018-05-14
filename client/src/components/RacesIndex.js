import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, UncontrolledTooltip } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faClock from '@fortawesome/fontawesome-free-regular/faClock';
import faRoad from '@fortawesome/fontawesome-free-solid/faRoad';

import { Link } from 'react-router-dom';

import { deleteRace } from '../actions';

class RacesIndex extends Component {
  constructor(props) {
    super(props);

    this.now = new moment();
  }

  onDeleteClick(id) {
    this.props.deleteRace(id);
  }

  renderNoteIcon(race) {
      if (this.now.isBefore(race.start)) {
        let start = moment(race.start);
        return (
          <span>
            <span className="ml-1" id={`race-note-${race.id}`}>
              <FontAwesomeIcon icon={faClock} />
            </span>
            <UncontrolledTooltip target={`race-note-${race.id}`}>
              Upcoming: starts {start.fromNow()}
            </UncontrolledTooltip>
          </span>
        );
      } else if (this.now.isAfter(race.start) && this.now.isBefore(race.end)) {
        return 'ACTIVE';
      } else {
        let end = moment(race.end);
        return (
          <span>
            <span className="ml-1" id={`race-note-${race.id}`}>
              <FontAwesomeIcon icon={faRoad} />
            </span>
            <UncontrolledTooltip target={`race-note-${race.id}`}>
              Ended {end.fromNow()}
            </UncontrolledTooltip>
          </span>
        );      }
  }

  renderRaces() {
    if (!this.props.races) {
      return (
        <div>
          <h6>No Races Exist Yet.</h6>
          <Button className="btn-block" color="primary" tag={Link} to="/races/create">Create Race</Button>
        </div>
        );
    }

    return _.map(this.props.races, race =>
      <li className="list-group-item" key={race.id}>
        <Link to={`/races/manage/${race.id}`}>{race.name}</Link>{this.renderNoteIcon(race)}
        <div className="float-right">
          <div className="btn-group">
            <Link to={`/races/${race.id}`} className="mr-1"><FontAwesomeIcon icon={faEdit} /></Link>
            <a href=""><FontAwesomeIcon icon={faTrashAlt} onClick={() => this.onDeleteClick(race.id)} /></a>
          </div>
        </div>
      </li>
    );
  }

  render() {
    return (
      <div>
        <div className="mb-3">
          <div className="float-right">
            <Link className="btn btn-primary" to="/races/create">New Race</Link>
          </div>

          <h3>Races</h3>
        </div>

        <ul className="list-group">
          {this.renderRaces()}
        </ul>
      </div>
      );
  }
}

export default connect(races => races, { deleteRace })(RacesIndex);
