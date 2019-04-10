import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';

import { Link } from 'react-router-dom';

import { deleteDriver } from '../actions';

class DriversIndex extends Component {
  constructor(props) {
    super(props);

    this.now = new moment();
  }

  onDeleteClick(id) {
    this.props.deleteDriver(id);
  }

  renderDrivers() {
    return _.map(this.props.drivers, driver =>
      <li className="list-group-item" key={driver.id}>
        <Link to={`/drivers/${driver.id}`}>{driver.firstname} {driver.lastname}</Link>
        <div className="float-right">
          <div className="btn-group">
            <Link to={`/drivers/${driver.id}`} className="mr-1"><FontAwesomeIcon icon={faEdit} /></Link>
            <a href=""><FontAwesomeIcon icon={faTrashAlt} onClick={() => this.onDeleteClick(driver.id)} /></a>
          </div>
        </div>
      </li>
    );
  }

  render() {
    return (
      <div className="text-light mr-1">
        <div className="float-right">
          <Button tag={Link} to="/drivers/create" color="primary">New Driver</Button>
        </div>  
        <h3>Drivers</h3>

        <ul className="list-group">
          {this.renderDrivers()}
        </ul>
      </div>
      );
  }
}

export default connect(drivers => drivers, { deleteDriver })(DriversIndex);
