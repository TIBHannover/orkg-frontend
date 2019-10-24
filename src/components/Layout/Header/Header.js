import React, { Component } from 'react';
import {
  Button, ButtonDropdown, Collapse, Container, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem,
  NavLink, Navbar, NavbarToggler, Tooltip, ButtonGroup, Row, Badge
} from 'reactstrap';
import styled from 'styled-components';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { ReactComponent as Logo } from '../../../assets/img/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faUser } from '@fortawesome/free-solid-svg-icons';
import ROUTES from '../../../constants/routes.js';
import { Cookies } from 'react-cookie';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Authentication from '../../Authentication/Authentication';
import SearchForm from './SearchForm';
import { reverse } from 'named-urls';
import { openAuthDialog, updateAuth } from '../../../actions/auth';


const StyledGravatar = styled(Gravatar)`
  border: 3px solid ${(props) => props.theme.avatarBorderColor};
  cursor: pointer;
`;

const StyledAuthTooltip = styled(Tooltip)`
  & .tooltip-inner {
    font-size: 16px;
    background-color: ${(props) => props.theme.darkblue};
    max-width: 350px;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

    .btn {
      border-color: ${(props) => props.theme.darkblue};
      background-color: ${(props) => props.theme.buttonDark};

      &:hover {
        background-color: ${(props) => props.theme.darkblueDarker};
      }
    }
  }

  & .arrow:before {
    border-bottom-color: ${(props) => props.theme.darkblue} !important;
  }
`;

class Header extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.dropdownOpen = this.toggleDropdown.bind(this);

    this.state = {
      isOpen: false,
      dropdownOpen: false,
      userTooltipOpen: false,
    };
  }

  componentDidMount() {
    const cookies = new Cookies();
    let token = cookies.get('token') ? cookies.get('token') : null;
    if (token && !this.props.user) {
      this.props.updateAuth({ user: { displayName: 'John Doe', id: 1, token: token } })
    }
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  toggleDropdown() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  toggleUserTooltip = () => {
    this.setState({
      userTooltipOpen: !this.state.userTooltipOpen,
    });
  };

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
                <NavLink tag={RouterNavLink} exact to={ROUTES.PAPERS}>
                  View all papers{/* TODO: add taxonomy "Browse by research field" <FontAwesomeIcon icon={faSortDown} pull="right" /> */}
                </NavLink>
              </NavItem>
              <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.dropdownOpen} nav inNavbar>
                <DropdownToggle nav className="ml-4">Tools <FontAwesomeIcon icon={faSortDown} pull="right" /></DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem tag={RouterNavLink} exact to={ROUTES.STATS}>Statistics</DropdownItem>
                  <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESOURCES}>Resources <small><Badge color="info">Beta</Badge></small></DropdownItem>
                  <DropdownItem tag={RouterNavLink} exact to={ROUTES.PREDICATES}>Predicates <small><Badge color="info">Beta</Badge></small></DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </Nav>
            <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
              <Button color="primary" className="mr-3">Add paper</Button>
            </Link>

            <SearchForm placeholder="Search..." />
            {this.props.user !== null && (
              <div>
                <StyledGravatar className="rounded-circle" email="example@example.com" size={40} id="TooltipExample" />
                <StyledAuthTooltip trigger="click" innerClassName="pr-3 pl-3 pt-3 pb-3 clearfix" placement="bottom-end" isOpen={this.state.userTooltipOpen} target="TooltipExample" toggle={this.toggleUserTooltip}>
                  <Row>
                    <div className="col-3 text-center">
                      <Link onClick={this.toggleUserTooltip} to={reverse(ROUTES.USER_PROFILE, { userId: this.props.user.id })} >
                        <StyledGravatar className="rounded-circle" style={{ border: '3px solid #fff' }} email="example@example.com" size={76} id="TooltipExample" />
                      </Link>
                    </div>
                    <div className="col-9">
                      Good evening {this.props.user.displayName},
                      <ButtonGroup className="mt-2" size="sm">
                        <Button color="secondary" onClick={this.toggleUserTooltip} tag={Link} to={ROUTES.USER_SETTINGS} >
                          Settings
                        </Button>
                        <Button onClick={this.toggleUserTooltip} tag={Link} to={ROUTES.SIGNOUT}>
                          Sign out
                        </Button>
                      </ButtonGroup>
                    </div>
                  </Row>
                </StyledAuthTooltip>
              </div>
            )}
            {!this.props.user && (
              <Button color="primary" onClick={() => this.props.openAuthDialog('signin')}>
                {' '}
                <FontAwesomeIcon className="mr-1" icon={faUser} /> Sign in
              </Button>
            )}
          </Collapse>

          <Authentication />
        </Container>
      </Navbar>
    );
  }
}

const mapStateToProps = (state) => ({
  dialogIsOpen: state.auth.dialogIsOpen,
  user: state.auth.user,
});

const mapDispatchToProps = (dispatch) => ({
  openAuthDialog: (action) => dispatch(openAuthDialog(action)),
  updateAuth: (data) => dispatch(updateAuth(data)),
});

Header.propTypes = {
  openAuthDialog: PropTypes.func.isRequired,
  updateAuth: PropTypes.func.isRequired,
  user: PropTypes.object,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Header);
