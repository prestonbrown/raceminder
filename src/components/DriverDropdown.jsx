import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default class DriverDropdown extends Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
			value: '- Select a Driver -',
			dropdownOpen: false,
			driverNames: this.props.driverNames
		};
	}

	toggle() {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	}

	select(event) {
		this.setState({
			dropdownOpen: !this.state.dropdownOpen,
			value: event.target.innerText
		});
		this.props.onSelect(event.target.innerText);
	}

	render() {
		return (
		<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
			<DropdownToggle caret>
				{this.state.value}
			</DropdownToggle>

			<DropdownMenu>
				{
					this.state.driverNames.map((name, index) =>
						<DropdownItem onClick={this.select.bind(this)} key={index}>{name}</DropdownItem>
					)
				}
			</DropdownMenu>
		</Dropdown>
		);
	}
}
