import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';

class RacesIndex extends Component {
  renderRaces() {
    return _.map(this.props.races, race => <li className="list-group-item" key={race.id}>{race.name}</li>);
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

export default connect((races) => races)(RacesIndex)
