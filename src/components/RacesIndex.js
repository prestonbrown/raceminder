import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { connect } from 'react-redux';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faClock from '@fortawesome/fontawesome-free-regular/faClock';

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
      let noteIcon = null;
      if (this.now.isBefore(race.start)) {
        let start = moment(race.start);
        noteIcon = <span className="ml-1" title={'Upcoming: starts ' + start.fromNow()}><FontAwesomeIcon icon={faClock} /></span>;
      } else if (this.now.isAfter(race.start) && this.now.isBefore(race.end)) {
        noteIcon = 'ACTIVE';
      } else {
        noteIcon = '';
      }
      return <span>{noteIcon}</span>
  }

  renderRaces() {
    return _.map(this.props.races, race =>
      <li className="list-group-item" key={race.id}>
        <Link to={`/races/manage/${race.id}`}>{race.name}</Link>{this.renderNoteIcon(race)}
        <div className="float-right">
          <div className="btn-group">
            <Link to={`/races/${race.id}`} className="mr-1"><FontAwesomeIcon icon={faEdit} /></Link>
            <FontAwesomeIcon icon={faTrashAlt} onClick={() => this.onDeleteClick(race.id)} />
          </div>
        </div>
      </li>
    );
  }

  render() {
    return (
      <div>
        <h3>Races</h3>

        <ul className="list-group">
          {this.renderRaces()}
        </ul>
      </div>
      );
  }
}

export default connect((races) => races, { deleteRace })(RacesIndex)
