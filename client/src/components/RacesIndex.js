import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, UncontrolledTooltip } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';
import faClock from '@fortawesome/fontawesome-free-regular/faClock';
import faBullhorn from '@fortawesome/fontawesome-free-solid/faBullhorn';
import faRoad from '@fortawesome/fontawesome-free-solid/faRoad';

import { Link } from 'react-router-dom';

import { deleteRace } from '../actions';

const RaceCard = ({race, car, track, handleDelete}) => {
  const now = new moment();
  const borderStyle = now.isAfter(race.start) && now.isBefore(race.end) ? 'border-success' : (now.isAfter(race.end) ? 'border-light' : '');
  const opacity = now.isAfter(race.end) ? '0.7' : '1'
  const background = now.isAfter(race.end) ? 'bg-secondary text-white' : '';

  return (
    <div className={`card h-100 ${borderStyle} ${background}`} style={{ opacity: opacity }}>
      <img className="card-image-top" src={car.picture} alt="race car" style={{ height: '150px', objectFit: 'cover' }} />
      <div className="card-body">
        <p className="card-text mb-1">{race.name} <NoteIcon race={race} /></p>
        <div className="card-text mb-2">
          <div className="small em">{track.name}</div>
          <div className="small">{moment(race.start).format('LLL')} - {moment(race.end).format('LLL')}</div>
        </div>
        <Link className="card-link" to={`/races/${race.id}`}>Edit</Link>
        <Link className="card-link" to={`/races/manage/${race.id}`}>Manage</Link>        
        <a className="card-link" onClick={handleDelete} role="link" tabIndex={0}>Delete</a>
      </div>
    </div>);
}

const NoteIcon = ({ race }) => {
  const now = new moment();

  if (now.isBefore(race.start)) {
    const start = moment(race.start);
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
  } else if (now.isAfter(race.start) && now.isBefore(race.end)) {
    return (
      <span>
        <span className="ml-1" id={`race-note-${race.id}`}>
          <FontAwesomeIcon icon={faBullhorn} />
        </span>
        <UncontrolledTooltip target={`race-note-${race.id}`}>
          Race is currently active
        </UncontrolledTooltip>
      </span>
      );
  } else {
    const end = moment(race.end);
    return (
      <span>
        <span className="ml-1" id={`race-note-${race.id}`}>
          <FontAwesomeIcon icon={faRoad} />
        </span>
        <UncontrolledTooltip target={`race-note-${race.id}`}>
          Ended {end.fromNow()}
        </UncontrolledTooltip>
      </span>
      );      
  }
};

class RacesIndex extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideCompleted: false
    };
  }

  onDeleteClicked(id) {
    this.props.deleteRace(id);
  }

  onHideCompletedClicked = () => {
    this.setState({ hideCompleted: !this.state.hideCompleted });
  }

  renderRaces() {
    const { races, cars, tracks } = this.props;
    const now = new moment();

    let sortedRaces = _.sortBy(races, 'start');
    if (this.state.hideCompleted) {
      sortedRaces = _.filter(sortedRaces, r => !now.isAfter(r.end));
    }

    if (!races) {
      return (
        <div>
          <h6>No Races Exist Yet.</h6>
          <Button className="btn-block" color="primary" tag={Link} to="/races/create">Create Race</Button>
        </div>
        );
    }

    return (
      <div className="row">
      {_.map(sortedRaces, race =>
        <div key={race.id} className="col-sm-4 mb-2"> 
          <RaceCard 
            race={race} 
            car={cars[race.car]} 
            track={tracks[race.track]} 
            handleDelete={() => this.onDeleteClicked(race.id)} />
        </div>
        )
      }
      </div>
      );
  }

  render() {
    return (
      <div>
        <div className="mb-3">
          <div className="float-right">
            <Link className="btn btn-primary" to="/races/create">New Race</Link>
            <Button active={this.state.hideCompleted} aria-pressed={this.state.hideCompleted} autoComplete="off" color="secondary" onClick={this.onHideCompletedClicked}>Hide Completed</Button>          
          </div>
          <h3>Races</h3>
        </div>

        {this.renderRaces()}
      </div>
      );
  }
}

export default connect(({ races, cars, tracks }) => ({ races, cars, tracks }), { deleteRace })(RacesIndex);
