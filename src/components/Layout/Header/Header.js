import { createRef, Component } from 'react';
import {
    Button,
    UncontrolledButtonDropdown as ButtonDropdown,
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
import Jumbotron from 'components/Home/Jumbotron';
import AddNew from './AddNew';
import { ReactComponent as Logo } from 'assets/img/logo.svg';
import { ReactComponent as LogoWhite } from 'assets/img/logo_white.svg';
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
import { getUserInformation } from 'services/backend/users';
import greetingTime from 'greeting-time';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { compose } from 'redux';
import env from '@beam-australia/react-env';
import { toast } from 'react-toastify';
import HomeBannerBg from 'assets/img/graph-background.svg';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import AboutMenu from 'components/Layout/Header/AboutMenu';

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
    @media (min-width: 481px) and (max-width: 1100px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${props => (!props.cookieInfoDismissed ? '80px' : '14px')}
        }
    }  
    @media (max-width: 480px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${props => (!props.cookieInfoDismissed ? '150px' : '14px')}
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
    border: 3px solid ${props => props.theme.dark};
    cursor: pointer;
`;

const StyledTopBar = styled.div`
    @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
        .navbar-collapse {
            margin-top: 0.4rem;
        }
        .nav-item {
            border-top: 1px solid ${props => props.theme.light};
        }
        .btn {
            width: 100%;
        }
        .btn-group {
            display: block !important;
        }
        .dropdown-menu {
            width: 100%;
        }
        .label {
            display: inline;
        }
        .input-group {
            width: 100%;
        }
        &.home-page {
            .nav-item {
                border-top-color: ${props => props.theme.secondaryDarker};
            }
        }
    }

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
        background-color: ${props => props.theme.secondary};
        max-width: 430px;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.13);

        .btn {
            border-color: ${props => props.theme.secondary};
            background-color: ${props => props.theme.dark};

            &:hover {
                background-color: ${props => props.theme.secondaryDarker};
            }
        }
    }

    & .arrow:before {
        border-bottom-color: ${props => props.theme.secondary} !important;
    }

    @media (max-width: ${props => props.theme.gridBreakpoints.sm}) {
        .btn-group {
            width: 100%;
            flex-direction: column;
            .btn:first-child {
                border-radius: ${props => props.theme.borderRadius} ${props => props.theme.borderRadius} 0 0;
            }
            .btn:last-child {
                border-radius: 0 0 ${props => props.theme.borderRadius} ${props => props.theme.borderRadius};
            }
        }
        .col-3 {
            display: none;
        }
        .col-9 {
            flex: 0 0 100%;
            max-width: 100% !important;
        }
    }
`;

class Header extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        this.state = {
            isOpen: false,
            isOpenAboutMenu: false,
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
        cookies.remove('token', { path: env('PUBLIC_URL') });
        cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
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
                    cookies.remove('token', { path: env('PUBLIC_URL') });
                    cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
                    this.props.resetAuth();
                });
        }
    };

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    toggleAboutMenu = () => {
        this.setState({
            isOpenAboutMenu: !this.state.isOpenAboutMenu
        });
    };

    closeMenu = () => {
        this.setState({
            isOpen: false,
            isOpenAboutMenu: false
        });
    };

    toggleUserTooltip = () => {
        this.setState({
            userTooltipOpen: !this.state.userTooltipOpen
        });
    };

    handleSignOut = () => {
        this.props.resetAuth();
        const cookies = new Cookies();
        cookies.remove('token', { path: env('PUBLIC_URL') });
        cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
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
        } else {
            this.toggle();
        }
    };

    render() {
        if (this.state.redirectLogout) {
            return <Redirect to={{ pathname: '/', state: { signedOut: true } }} />;
        }
        const email = this.props.user && this.props.user.email ? this.props.user.email : 'example@example.com';
        const greeting = greetingTime(new Date());
        const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;
        const navbarClasses = `
            ${this.state.isHomePageStyle ? 'home-page' : ''}
            ${this.state.isHomePageStyle && this.state.isOpen ? 'shadow' : ''}
        `;

        return (
            <StyledTopBar className={this.state.isHomePageStyle ? 'home-page' : ''}>
                <Navbar
                    light={!this.state.isHomePageStyle}
                    dark={this.state.isHomePageStyle}
                    className={navbarClasses}
                    expand="md"
                    fixed="top"
                    id="main-navbar"
                >
                    <GlobalStyle scrollbarWidth={scrollbarWidth(true)} cookieInfoDismissed={cookieInfoDismissed} />

                    <div
                        style={{ display: 'flex', width: '100%', transition: 'width 1s ease-in-out' }}
                        className={!this.state.isHomePageStyle ? 'p-0 container' : 'container-sm'}
                    >
                        <StyledLink to={ROUTES.HOME} className="mr-4 p-0" onClick={this.closeMenu}>
                            {!this.state.isHomePageStyle && <Logo />}
                            {this.state.isHomePageStyle && <LogoWhite />}
                        </StyledLink>

                        <NavbarToggler onClick={this.toggle} />

                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav className="mr-auto flex-shrink-0" navbar>
                                {/* view menu */}
                                <ButtonDropdown nav inNavbar>
                                    <DropdownToggle nav className="ml-2">
                                        View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.COMPARISONS} onClick={this.closeMenu}>
                                            Comparisons
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.PAPERS} onClick={this.closeMenu}>
                                            Papers
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.VISUALIZATIONS} onClick={this.closeMenu}>
                                            Visualizations
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.SMART_REVIEWS} onClick={this.closeMenu}>
                                            SmartReviews{' '}
                                            <small>
                                                <Badge color="info">Beta</Badge>
                                            </small>
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.LITERATURE_LISTS} onClick={this.closeMenu}>
                                            Literature list{' '}
                                            <small>
                                                <Badge color="info">Beta</Badge>
                                            </small>
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.BENCHMARKS} onClick={this.closeMenu}>
                                            Benchmarks
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESEARCH_FIELDS} onClick={this.closeMenu}>
                                            Research fields
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.OBSERVATORIES} onClick={this.closeMenu}>
                                            Observatories{' '}
                                            <small>
                                                <Badge color="info">Beta</Badge>
                                            </small>
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.ORGANIZATIONS} onClick={this.closeMenu}>
                                            Organizations{' '}
                                            <small>
                                                <Badge color="info">Beta</Badge>
                                            </small>
                                        </DropdownItem>
                                        <DropdownItem divider />

                                        <DropdownItem header>Advanced views</DropdownItem>

                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.RESOURCES} onClick={this.closeMenu}>
                                            Resources
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.PROPERTIES} onClick={this.closeMenu}>
                                            Properties
                                        </DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.CLASSES} onClick={this.closeMenu}>
                                            Classes
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>

                                {/* tools menu */}
                                <ButtonDropdown nav inNavbar>
                                    <DropdownToggle nav className="ml-2">
                                        Tools <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.TOOLS} onClick={this.closeMenu}>
                                            Tools overview
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem header>Data entry</DropdownItem>
                                        <DropdownItem
                                            tag={RouterNavLink}
                                            exact
                                            to={ROUTES.CONTRIBUTION_EDITOR}
                                            onClick={e => this.requireAuthentication(e, ROUTES.CONTRIBUTION_EDITOR)}
                                        >
                                            Contribution editor
                                        </DropdownItem>
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
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.TEMPLATES} onClick={this.closeMenu}>
                                            Templates
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem header>Data export</DropdownItem>
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.DATA} onClick={this.closeMenu}>
                                            Data Access
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>

                                {/* about menu */}
                                <ButtonDropdown isOpen={this.state.isOpenAboutMenu} toggle={this.toggleAboutMenu} nav inNavbar>
                                    <DropdownToggle nav className="ml-2" onClick={this.toggleAboutMenu}>
                                        About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <AboutMenu closeMenu={this.closeMenu} />
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.HELP_CENTER} onClick={this.closeMenu}>
                                            Help center
                                        </DropdownItem>
                                        <DropdownItem
                                            tag="a"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/"
                                            onClick={this.closeMenu}
                                        >
                                            GitLab <Icon size="sm" icon={faExternalLinkAlt} />
                                        </DropdownItem>
                                        <DropdownItem divider />
                                        <DropdownItem tag={RouterNavLink} exact to={ROUTES.STATS} onClick={this.closeMenu}>
                                            Statistics
                                        </DropdownItem>
                                    </DropdownMenu>
                                </ButtonDropdown>
                            </Nav>

                            <SearchForm placeholder="Search..." onSearch={this.closeMenu} />

                            <AddNew isHomePageStyle={this.state.isHomePageStyle} onAdd={this.closeMenu} />

                            {!!this.props.user && (
                                <div className="ml-2">
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
                                                    <Button
                                                        color="secondary"
                                                        className="text-nowrap"
                                                        onClick={this.toggleUserTooltip}
                                                        tag={Link}
                                                        to={reverse(ROUTES.USER_SETTINGS)}
                                                    >
                                                        My account
                                                    </Button>
                                                    <Button onClick={this.handleSignOut} className="text-nowrap">
                                                        Sign out
                                                    </Button>
                                                </ButtonGroup>
                                            </div>
                                        </Row>
                                    </StyledAuthTooltip>
                                </div>
                            )}

                            {!this.props.user && (
                                <div className="mx-2 flex-shrink-0">
                                    <Button
                                        color="secondary"
                                        className="pl-4 pr-4 sign-in"
                                        outline
                                        onClick={() => this.props.openAuthDialog({ action: 'signin' })}
                                    >
                                        {' '}
                                        <FontAwesomeIcon className="mr-1" icon={faUser} /> Sign in
                                    </Button>
                                </div>
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
