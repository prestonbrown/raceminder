import _ from 'lodash';
import moment from 'moment';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faEdit from '@fortawesome/fontawesome-free-regular/faEdit'
import faTrashAlt from '@fortawesome/fontawesome-free-regular/faTrashAlt';

import { Link } from 'react-router-dom';

import { deleteCar } from '../actions';

class CarsIndex extends Component {
  constructor(props) {
    super(props);

    this.now = new moment();
  }

  onDeleteClick(id) {
    this.props.deleteCar(id);
  }

  renderCars() {
    return _.map(this.props.cars, car =>
      <li className="list-group-item" key={car.id}>
        <div class="media">
          <img className="mr-3" src={car.picture} style={{ width: "48px" }} alt="race car" />
          <div class="media-body">
            <h5>
              <Link to={`/cars/${car.id}`}>{car.firstname} {car.name}</Link>
            </h5>
          </div>
        </div>

        <div className="float-right">
          <div className="btn-group">
            <Link to={`/cars/${car.id}`} className="mr-1"><FontAwesomeIcon icon={faEdit} /></Link>
            <a href=""><FontAwesomeIcon icon={faTrashAlt} onClick={() => this.onDeleteClick(car.id)} /></a>
          </div>
        </div>
      </li>
    );
  }

  render() {
    return (
      <div>
        <div className="float-right">
          <Button tag={Link} to="/cars/create" color="primary">New Car</Button>
        </div>  
        <h3>Cars</h3>

        <ul className="list-group">
          {this.renderCars()}
        </ul>
      </div>
      );
  }
}

export default connect((cars) => cars, { deleteCar })(CarsIndex);
