import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default class DriverDropdown extends Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = { 
			dropdownOpen: false,
			driverNames: [ this.props.driverNames ] 
		};
	}

	toggle() {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	}

	/*
	addDriver(name) {
		var driverNames = this.state.driverNames;
		if (driverNames.indexOf(name) === -1) {
			driverNames.push(name);
			this.setState({ driverNames });
		}
	}

	removeDriver(name) {
		var driverNames = this.state.driverNames;
		var index = driverNames.indexOf(name);
		if (index !== -1) {
			driverNames.splice(index, 1);
			this.setState({ driverNames });
		}
	}
	*/

	render() {
		return (
		<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
			<DropdownToggle caret>
				Drivers
			</DropdownToggle>

			<DropdownMenu>
				{
					this.state.driverNames && this.state.driverNames.map((name, index) => <DropdownItem key={index}>{name}</DropdownItem>)
				}
			</DropdownMenu>
		</Dropdown>
		);
	}
}
