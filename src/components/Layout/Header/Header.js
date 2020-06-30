import React, { Component } from 'react';
import {
    Button,
    ButtonDropdown,
    UncontrolledButtonDropdown,
    Collapse,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavItem,
    NavLink,
    Navbar,
    NavbarToggler,
    Tooltip,
    ButtonGroup,
    Row,
    Badge
} from 'reactstrap';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import { ReactComponent as Logo } from 'assets/img/logo.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import { Cookies } from 'react-cookie';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Authentication from 'components/Authentication/Authentication';
import SearchForm from './SearchForm';
import { openAuthDialog, updateAuth, resetAuth } from 'actions/auth';
import { Redirect } from 'react-router-dom';
import { getUserInformation } from 'network';
import greetingTime from 'greeting-time';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { toast } from 'react-toastify';
const cookies = new Cookies();

const StyledLink = styled(Link)`
    :focus {
        outline: none;
    }
    ::-moz-focus-inner {
        border: 0;
    }
`;

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
    cursor: pointer;
`;

const StyledAuthTooltip = styled(Tooltip)`
    & .tooltip {
        opacity: 1 !important;
    }
    & .tooltip-inner {
        font-size: 16px;
        background-color: ${props => props.theme.darkblue};
        max-width: 410px;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

        .btn {
            border-color: ${props => props.theme.darkblue};
            background-color: ${props => props.theme.buttonDark};

            &:hover {
                background-color: ${props => props.theme.darkblueDarker};
            }
        }
    }

    & .arrow:before {
        border-bottom-color: ${props => props.theme.darkblue} !important;
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
            redirectLogout: false
        };

        this.userPopup = React.createRef();

        this.logoutTimeoutId = null; // timeout for autologout
    }

    componentDidMount() {
        this.userInformation();
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentDidUpdate() {
        if (this.state.redirectLogout) {
            this.setState({
                redirectLogout: false
            });
        }
        if (!this.logoutTimeoutId && this.props.user) {
            const token_expires_in = cookies.get('token_expires_in') ? cookies.get('token_expires_in') : null;
            // Get the diffrence between token expiration time and now
            const diff = new Date(token_expires_in) - Date.now();
            // set timeout to autologout
            this.logoutTimeoutId = setTimeout(this.tokenExpired, diff);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
        if (this.logoutTimeoutId) {
            clearTimeout(this.logoutTimeoutId); // clear timeout
            this.logoutTimeoutId = null;
        }
    }

    handleClickOutside = event => {
        if (this.userPopup.current && !this.userPopup.current.contains(event.target) && this.state.userTooltipOpen) {
            this.toggleUserTooltip();
        }
    };

    tokenExpired = () => {
        toast.warn('User session expired, please sign in again!');
        cookies.remove('token');
        cookies.remove('token_expires_in');
        this.props.resetAuth();
        this.props.openAuthDialog('signin');
        this.logoutTimeoutId = null;
    };

    userInformation = () => {
        const cookies = new Cookies();
        const token = cookies.get('token') ? cookies.get('token') : null;
        const token_expires_in = cookies.get('token_expires_in') ? cookies.get('token_expires_in') : null;
        if (token && !this.props.user) {
            getUserInformation()
                .then(userData => {
                    this.props.updateAuth({
                        user: {
                            displayName: userData.display_name,
                            id: userData.id,
                            token: token,
                            tokenExpire: token_expires_in,
                            email: userData.email
                        }
                    });
                })
                .catch(error => {
                    cookies.remove('token');
                    cookies.remove('token_expires_in');
                    this.props.resetAuth();
                });
        }
    };

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

    toggleUserTooltip = () => {
        this.setState({
            userTooltipOpen: !this.state.userTooltipOpen
        });
    };

    handleSignOut = () => {
        this.props.resetAuth();
        const cookies = new Cookies();
        cookies.remove('token');

        this.toggleUserTooltip();

        this.setState({
            redirectLogout: true
        });
    };

    render() {
        if (this.state.redirectLogout) {
            return <Redirect to={{ pathname: '/', state: { signedOut: true } }} />;
        }
        const email = this.props.user && this.props.user.email ? this.props.user.email : 'example@example.com';
        const greeting = greetingTime(new Date());

        return (
            <Navbar color="light" expand="md" fixed="top" id="main-navbar" light>
                <Container className="p-0">
                    <StyledLink to={ROUTES.HOME} className="mr-4 p-0">
                        <Logo />
                    </StyledLink>

                    <NavbarToggler onClick={this.toggle} />

                    <Collapse isOpen={this.state.isOpen} navbar>
                        <Nav className="mr-auto flex-shrink-0" navbar>
                            <NavItem className="ml-2 ml-md-0">
                                <NavLink tag={RouterNavLink} exact to={ROUTES.PAPERS}>
                                    Papers
                                    {/* TODO: add taxonomy "Browse by research field" <FontAwesomeIcon icon={faSortDown} pull="right" /> */}
                                </NavLink>
                            </NavItem>

                            <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.dropdownOpen} nav inNavbar>
                                <DropdownToggle nav className="ml-2">
                                    Tools <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.STATS}>
                                        Statistics
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESOURCES}>
                                        Resources{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.PREDICATES}>
                                        Predicates{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.CONTRIBUTION_TEMPLATES}>
                                        Templates{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>

                            <UncontrolledButtonDropdown nav inNavbar>
                                <DropdownToggle nav className="ml-2">
                                    About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem
                                        tag="a"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href="https://projects.tib.eu/orkg/project/documentation/"
                                    >
                                        Features <Icon size="sm" icon={faExternalLinkAlt} />
                                    </DropdownItem>
                                    <DropdownItem tag="a" target="_blank" rel="noopener noreferrer" href="https://projects.tib.eu/orkg/">
                                        Project <Icon size="sm" icon={faExternalLinkAlt} />
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.OBSERVATORIES}>
                                        Observatories{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                    <DropdownItem tag={RouterNavLink} exact to={ROUTES.ORGANIZATIONS}>
                                        Organizations{' '}
                                        <small>
                                            <Badge color="info">Beta</Badge>
                                        </small>
                                    </DropdownItem>
                                </DropdownMenu>
                            </UncontrolledButtonDropdown>
                        </Nav>

                        <SearchForm placeholder="Search..." />

                        <Button color="primary" className="mr-3 pl-4 pr-4 flex-shrink-0" tag={Link} to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                            Add paper
                        </Button>

                        {this.props.user !== null && (
                            <div>
                                <StyledGravatar className="rounded-circle" email={email} size={40} id="TooltipExample" />
                                <StyledAuthTooltip
                                    fade={false}
                                    trigger="click"
                                    innerClassName="pr-3 pl-3 pt-3 pb-3 clearfix"
                                    placement="bottom-end"
                                    isOpen={this.state.userTooltipOpen}
                                    target="TooltipExample"
                                    toggle={this.toggleUserTooltip}
                                    innerRef={this.userPopup}
                                >
                                    <Row>
                                        <div className="col-3 text-center">
                                            <Link onClick={this.toggleUserTooltip} to={reverse(ROUTES.USER_PROFILE, { userId: this.props.user.id })}>
                                                <StyledGravatar
                                                    className="rounded-circle"
                                                    style={{ border: '3px solid #fff' }}
                                                    email={email}
                                                    size={76}
                                                    id="TooltipExample"
                                                />
                                            </Link>
                                        </div>
                                        <div className="col-9 text-left">
                                            <span className="ml-1">
                                                {greeting} {this.props.user.displayName}
                                            </span>
                                            <ButtonGroup className="mt-2" size="sm">
                                                <Button
                                                    color="secondary"
                                                    onClick={this.toggleUserTooltip}
                                                    tag={Link}
                                                    to={reverse(ROUTES.USER_PROFILE, { userId: this.props.user.id })}
                                                >
                                                    Profile
                                                </Button>
                                                <Button color="secondary" onClick={this.toggleUserTooltip} tag={Link} to={ROUTES.USER_SETTINGS}>
                                                    Settings
                                                </Button>
                                                <Button onClick={this.handleSignOut}>Sign out</Button>
                                            </ButtonGroup>
                                        </div>
                                    </Row>
                                </StyledAuthTooltip>
                            </div>
                        )}

                        {!this.props.user && (
                            <Button color="darkblue" className="pl-4 pr-4 flex-shrink-0" outline onClick={() => this.props.openAuthDialog('signin')}>
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

const mapStateToProps = state => ({
    dialogIsOpen: state.auth.dialogIsOpen,
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    resetAuth: () => dispatch(resetAuth()),
    openAuthDialog: action => dispatch(openAuthDialog(action)),
    updateAuth: data => dispatch(updateAuth(data))
});

Header.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    updateAuth: PropTypes.func.isRequired,
    user: PropTypes.object,
    resetAuth: PropTypes.func.isRequired
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
