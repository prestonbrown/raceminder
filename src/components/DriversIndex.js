import React, { Component } from 'react';
import { connect } from 'react-redux';

class DriversIndex extends Component {
  render() {
    return <div>Driver Index</div>
  }
}

export default connect((drivers) => drivers)(DriversIndex)
