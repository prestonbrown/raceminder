import React, { Component } from 'react';
import moment from 'moment';

class StopWatch extends Component {
  constructor(props) {
    super(props);

    this.start = new moment();
    this.intervalId = null;
    this.state = {
      currentMs: 0
    };
  }

  componentWillMount() {
    this.intervalId = setInterval(this.timer, 51);
  }

  componentDidMount() {
    this.props.setStopTimerAction(this.stopTimer);
  }

  stopTimer = () => {    
    clearInterval(this.intervalId);
    const stop = new moment();
    this.props.handleStop && this.props.handleStop(this.start, stop);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
    //const stop = new moment();
    //this.props.handleStop && this.props.handleStop(this.start, stop);
  }

  timer = () => {
    this.setState({ currentMs: this.state.currentMs + 51 });
  }

  formatMilliSeconds(ms) {
    let remainderMs = Math.floor(ms / 10 % 100).toString().padStart(2, "0");
    let seconds = Math.floor(ms / 1000 % 60).toString().padStart(2, "0");
    let minutes = Math.floor(ms / 1000 / 60 % 60).toString().padStart(2, "0");

    return `${minutes}:${seconds}:${remainderMs}`;
  }

  render() {
    return (
      <div className="digital-clock-container">
        <div className="digital-clock-ghosts">88:88:88</div>
        <div className="digital-clock">
          {this.formatMilliSeconds(this.state.currentMs)}
        </div>
      </div>
    );
  }
}

export default StopWatch;