import React, { Component } from 'react';
import { Col, FormGroup, Label, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import moment from 'moment';

import Clock from 'react-live-clock';

class RacesManage extends Component {
  constructor(props) {
    super(props);

    this.race = props.race;
    console.log(this.race);
  }


  render() {
    const race = this.race;
    let color="black";
    if (moment().isAfter(race.start)) {
      color="red";
    }

    return (
      <div>
        <div className="row">
          <div className="col">
            <h1>Manage {race.name}</h1>
          </div>
          <div className="col-sm-3 text-right">
            <div className="digital-clock-container">
              <div className="digital-clock-ghosts">88:88:88 88</div>
              <Clock format={'h:mm:ss A'} ticking={true} className={`text-${color} digital-clock`} />
            </div>
          </div>
        </div>
        <FormGroup row>
          <Label className="text-right" sm={2}>Start Time:</Label>      
          <Col sm={4}>
            <span sm={4}>{moment(race.start).format('llll')}</span>
          </Col>
          <Label className="text-right" sm={2}>End Time:</Label>
          <Col sm={4}>
            <span sm={4}>{moment(race.end).format('llll')}</span>
          </Col>
        </FormGroup>
        <FormGroup row>
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

export default connect(mapStateToProps)(RacesManage)
