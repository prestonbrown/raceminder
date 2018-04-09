import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

export default class RaceInfo extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<Form>
				<FormGroup>
					<Label for="raceName">Race Name</Label>
					<Input type="text" name="name" id="raceName" />
				</FormGroup>

				<FormGroup>
					<Label for="raceTrack">Race Track</Label>
					<Input type="text" name="track" id="raceTrack" />
				</FormGroup>

				<FormGroup>
					<Label for="raceTrackLength">Track Length</Label>
					<Input type="number" name="trackLength" id="raceTrackLength" />
				</FormGroup>

				<FormGroup>
					<Label for="raceStartTime">Start Time</Label>
					<Input type="time" name="startTime" id="raceStartTime" />
				</FormGroup>

				<FormGroup>
					<Label for="raceEndTime">End Time</Label>
					<Input type="time" name="endTime" id="raceEndTime" />
				</FormGroup>

				<FormGroup>
					<Label for="raceRequiredStops">Required Stops</Label>
					<Input type="number" name="requiredStops" id="raceRequiredStops" />
				</FormGroup>

				<FormGroup>
					<Label for="raceRequiredStopLength">Required Stop Length</Label>
					<Input type="number" name="requiredStopLength" id="raceRequiredStopLength" />
				</FormGroup>
			</Form>
		);
	}
}