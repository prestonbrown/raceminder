import React, { Component } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';

export default class CarInfo extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<Form>
				<FormGroup>
					<Label for="carName">Car Name</Label>
					<Input type="text" name="name" id="carName" placeholder="The name of your car" />
				</FormGroup>

				<FormGroup>
					<Label for="carNumber">Car Number</Label>
					<Input type="number" name="number" id="carNumber" />
				</FormGroup>

				<FormGroup>
					<Label for="carFuelCapacity">Fuel Capacity</Label>
					<Input type="number" name="fuelCapacity" id="carFuelCapacity" />
				</FormGroup>

				<FormGroup>
					<Label for="carFuelReserve">Fuel Reserve Desired</Label>
					<Input type="number" name="fuelReserve" id="carFuelReserve" />
				</FormGroup>

				<FormGroup>
					<Label for="carEstMpg">Estimated MPG</Label>
					<Input type="number" name="estMpg" id="carEstMpg" />
				</FormGroup>
			</Form>
		);
	}
}