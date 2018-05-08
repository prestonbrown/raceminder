import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,

  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,

} from 'reactstrap';

export default class RMNav extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    return (
      <div>
        <Navbar color="light" light expand="md">
          <NavbarBrand tag={Link} to="/"><img src="/favicon.ico" alt="raceminder" width="32" /></NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="/drivers/">Drivers</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/cars/">Cars</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/races/">Races</NavLink>
              </NavItem>
              {/*
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Options
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    Option 1
                  </DropdownItem>
                  <DropdownItem>
                    Option 2
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>
                    Reset
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              */}
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
