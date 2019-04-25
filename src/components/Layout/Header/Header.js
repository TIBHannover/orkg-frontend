import React, { Component } from 'react';
import { Nav, NavItem, NavLink, Navbar, NavbarToggler, Collapse, Container, Button, ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap';
import SearchForm from './SearchForm';
import { ReactComponent as Logo } from '../../../assets/img/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown } from '@fortawesome/free-solid-svg-icons';
import { Link, NavLink as RouterNavLink } from "react-router-dom";
import ROUTES from '../../../constants/routes.js';

class Header extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.dropdownOpen = this.toggleDropdown.bind(this);

        this.state = {
            isOpen: false,
            dropdownOpen: false
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    toggleDropdown() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }

        render() {
            return (
                <Navbar color="light" expand="md" fixed="top" id="main-navbar" light>
                    <Container>
                        <Link to={ROUTES.HOME} className="mr-5 navbar-brand">
                            <Logo />
                        </Link>

                        <NavbarToggler onClick={this.toggle} />

                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="mr-auto" navbar>
                                <NavItem>
                                    <NavLink tag={RouterNavLink} exact to={ROUTES.RESOURCES}>
                                        View all resources{/* TODO: add taxonomy "Browse by research field" <FontAwesomeIcon icon={faSortDown} pull="right" /> */} 
                                    </NavLink>
                                </NavItem>
                                <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.dropdownOpen} nav inNavbar>
                                    <DropdownToggle nav className="ml-4">Debug <FontAwesomeIcon icon={faSortDown} pull="right" /></DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESOURCES}>All Resources</DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.PREDICATES}>All Predicates</DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </Nav>
                            <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                <Button color="primary" className="mr-3">Add paper</Button>
                            </Link>

                            <SearchForm placeholder="Search..." />
                        </Collapse>
                    </Container>
                </Navbar>
            );
        }
    }

    export default Header;