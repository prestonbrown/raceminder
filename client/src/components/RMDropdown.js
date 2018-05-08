import _ from 'lodash';
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { connect } from 'react-redux';
import { selectitem } from '../actions';

class RMDropdown extends Component {
	constructor(props) {
		super(props);

		this.toggle = this.toggle.bind(this);
		this.state = {
			dropdownOpen: false,
		};
	}

	toggle() {
		this.setState({ dropdownOpen: !this.state.dropdownOpen });
	}

	onSelect(itemId) {
		this.setState({
			dropdownOpen: !this.state.dropdownOpen,
		});
		this.props.selectDriver(itemId);
	}

	renderDropdownItems() {
		if (!this.props.items) {
			return;
		} else {
			return _.map(this.props.items, (item) => {
				return <DropdownItem onClick={() => this.onSelect(item.id) } key={item.id}>{item.name}</DropdownItem>
			})
		}
	}

	render() {
		return (
		<Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
			<DropdownToggle caret>
				{this.props.selectedItemId ? this.props.items[this.props.selectedItemId].name : ' - Select an Item -'}
			</DropdownToggle>

			<DropdownMenu>
				{this.renderDropdownItems()}
			</DropdownMenu>
		</Dropdown>
		);
	}
}

function mapStateToProps({ drivers }) {
	return { items: items.driverList, selectedItemId: items.selectedDriverId };
}

export default connect(mapStateToProps, { selectDriver })(itemDropdown);
