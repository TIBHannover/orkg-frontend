import { createRef, Component } from 'react';
import {
    Button,
    UncontrolledButtonDropdown,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarToggler,
    Tooltip,
    ButtonGroup,
    Row,
    Badge
} from 'reactstrap';
import { Link, NavLink as RouterNavLink, withRouter } from 'react-router-dom';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import Jumbotron from 'components/Home/Jumbotron';
import { ReactComponent as Logo } from 'assets/img/logo.svg';
import { ReactComponent as LogoWhite } from 'assets/img/logo_white.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import { Cookies } from 'react-cookie';
import Gravatar from 'react-gravatar';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Authentication from 'components/Authentication/Authentication';
import SearchForm from './SearchForm';
import { openAuthDialog, updateAuth, resetAuth } from 'actions/auth';
import { Redirect } from 'react-router-dom';
import { getUserInformation } from 'services/backend/users';
import greetingTime from 'greeting-time';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { compose } from 'redux';
import { toast } from 'react-toastify';
import HomeBannerBg from 'assets/img/graph-background.svg';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';

const cookies = new Cookies();

// determine the scroll bar width and compensate the width when a modal is opened
const GlobalStyle = createGlobalStyle`
    body.modal-open {
        #main-navbar, #paperHeaderBar {
            right: ${props => props.scrollbarWidth}px
        }
        #helpIcon {
            padding-right: ${props => props.scrollbarWidth}px
        }
        .woot-widget-bubble, .woot-widget-holder {
            margin-right: ${props => props.scrollbarWidth}px
        }
    }
`;

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

const StyledTopBar = styled.div`
    margin-bottom: 0;
    padding-top: 72px;

    // For the background
    background: #5f6474 url(${HomeBannerBg});
    background-position-x: 0%, 0%;
    background-position-y: 0%, 0%;
    background-size: auto, auto;
    background-size: cover;
    position: relative;
    background-attachment: fixed;
    background-position: center 10%;
    background-repeat: no-repeat;
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

        this.state = {
            isOpen: false,
            userTooltipOpen: false,
            redirectLogout: false,
            isHomePageStyle: this.props.location.pathname === ROUTES.HOME ? true : false
        };

        this.userPopup = createRef();

        this.logoutTimeoutId = null; // timeout for autologout
    }

    componentDidMount() {
        this.userInformation();
        document.addEventListener('mousedown', this.handleClickOutside);
        window.addEventListener('scroll', this.handleScroll);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.setState({ isHomePageStyle: this.props.location.pathname === ROUTES.HOME ? true : false });
        }
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
        window.removeEventListener('scroll', this.handleScroll);
        if (this.logoutTimeoutId) {
            clearTimeout(this.logoutTimeoutId); // clear timeout
            this.logoutTimeoutId = null;
        }
    }

    handleScroll = () => {
        if (window.pageYOffset > 0) {
            if (this.state.isHomePageStyle) {
                this.setState({ isHomePageStyle: false });
            }
        } else {
            if (!this.state.isHomePageStyle && this.props.location.pathname === ROUTES.HOME) {
                this.setState({ isHomePageStyle: true });
            }
        }
    };

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
        this.props.openAuthDialog({ action: 'signin' });
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
                            email: userData.email,
                            isCurationAllowed: userData.is_curation_allowed
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

    requireAuthentication = (e, redirectRoute) => {
        if (!this.props.user) {
            this.props.openAuthDialog({ action: 'signin', signInRequired: true, redirectRoute });
            // Don't follow the link when user is not authenticated
            e.preventDefault();
        }
    };

    render() {
        if (this.state.redirectLogout) {
            return <Redirect to={{ pathname: '/', state: { signedOut: true } }} />;
        }
        const email = this.props.user && this.props.user.email ? this.props.user.email : 'example@example.com';
        const greeting = greetingTime(new Date());

        return (
            <StyledTopBar className={this.state.isHomePageStyle ? 'home-page' : ''}>
                <Navbar className={this.state.isHomePageStyle ? 'home-page' : ''} expand="md" fixed="top" id="main-navbar">
                    <GlobalStyle scrollbarWidth={scrollbarWidth(true)} />

                    <div
                        style={{ display: 'flex', width: '100%', transition: 'width 1s ease-in-out' }}
                        className={!this.state.isHomePageStyle ? 'p-0 container' : ''}
                    >
                        <StyledLink to={ROUTES.HOME} className="mr-4 p-0">
                            {!this.state.isHomePageStyle && <Logo />}
                            {this.state.isHomePageStyle && <LogoWhite />}
                        </StyledLink>

                        <NavbarToggler onClick={this.toggle} />

                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="mr-auto flex-shrink-0" navbar>
                                {/* view menu */}
                                <UncontrolledButtonDropdown nav inNavbar>
                                    <DropdownToggle nav className="ml-2">
                                        View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.PAPERS}>
                                            Papers
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.COMPARISONS}>
                                            Comparisons
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESEARCH_FIELDS}>
                                            Research fields
                                        </DropdownItem>
                                        <DropdownItem divider />
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
                                        <DropdownItem divider />

                                        <DropdownItem header>Advanced views</DropdownItem>

                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESOURCES}>
                                            Resources
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.PREDICATES}>
                                            Properties
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.CLASSES}>
                                            Classes
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>

                                {/* tools menu */}
                                <UncontrolledButtonDropdown nav inNavbar>
                                    <DropdownToggle nav className="ml-2">
                                        Tools <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem
                                            tag={RouterNavLink}
                                            exact
                                            to={ROUTES.CSV_IMPORT}
                                            onClick={e => this.requireAuthentication(e, ROUTES.CSV_IMPORT)}
                                        >
                                            CSV import
                                        </DropdownItem>
                                        <DropdownItem
                                            tag={RouterNavLink}
                                            exact
                                            to={ROUTES.PDF_ANNOTATION}
                                            onClick={e => this.requireAuthentication(e, ROUTES.PDF_ANNOTATION)}
                                        >
                                            Survey table import
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.EXPORT_DATA}>
                                            Export data{' '}
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.CONTRIBUTION_TEMPLATES}>
                                            Templates
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>

                                {/* about menu */}
                                <UncontrolledButtonDropdown nav inNavbar>
                                    <DropdownToggle nav className="ml-2">
                                        About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem tag="a" target="_blank" rel="noopener noreferrer" href="https://projects.tib.eu/orkg/">
                                            About ORKG <Icon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                        <DropdownItem
                                            tag="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://projects.tib.eu/orkg/documentation/"
                                        >
                                            Features <Icon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                        <DropdownItem
                                            tag="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/home"
                                        >
                                            Documentation <Icon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.STATS}>
                                            Statistics
                                        </DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </Nav>

                            <SearchForm placeholder="Search..." />

                            <RequireAuthentication
                                component={Button}
                                color={!this.state.isHomePageStyle ? 'primary' : 'light'}
                                className="mr-3 pl-4 pr-4 flex-shrink-0"
                                tag={Link}
                                to={ROUTES.ADD_PAPER.GENERAL_DATA}
                            >
                                <FontAwesomeIcon className="mr-1" icon={faPlus} />
                                Add paper
                            </RequireAuthentication>

                            {!!this.props.user && (
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
                                                <Link
                                                    onClick={this.toggleUserTooltip}
                                                    to={reverse(ROUTES.USER_PROFILE, { userId: this.props.user.id })}
                                                >
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
                                <Button
                                    color={!this.state.isHomePageStyle ? 'secondary' : 'darkblue'}
                                    className="pl-4 pr-4 flex-shrink-0 sign-in"
                                    outline
                                    onClick={() => this.props.openAuthDialog({ action: 'signin' })}
                                >
                                    {' '}
                                    <FontAwesomeIcon className="mr-1" icon={faUser} /> Sign in
                                </Button>
                            )}
                        </Collapse>

                        <Authentication />
                    </div>
                </Navbar>

                {this.props.location.pathname === ROUTES.HOME && <Jumbotron />}
            </StyledTopBar>
        );
    }
}

const mapStateToProps = state => ({
    dialogIsOpen: state.auth.dialogIsOpen,
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    resetAuth: () => dispatch(resetAuth()),
    openAuthDialog: payload => dispatch(openAuthDialog(payload)),
    updateAuth: data => dispatch(updateAuth(data))
});

Header.propTypes = {
    openAuthDialog: PropTypes.func.isRequired,
    updateAuth: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    resetAuth: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired
};

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withRouter
)(Header);
