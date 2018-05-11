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

  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem

} from 'reactstrap';

import * as routes from '../routes';

import { SignOutDropdownItem } from './SignOut';

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

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  User
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem>
                    <Link to={routes.SIGN_IN}>Sign In</Link>
                  </DropdownItem>
                  <DropdownItem>
                    <Link to={routes.ACCOUNT}>Account Preferences</Link>
                  </DropdownItem>

                  <DropdownItem divider />

                  <SignOutDropdownItem />
                </DropdownMenu>
              </UncontrolledDropdown>

            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}
