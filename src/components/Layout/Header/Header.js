import { useRef, useState, useEffect, useCallback } from 'react';
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
import { Link, NavLink as RouterNavLink, useLocation, useNavigate } from 'react-router-dom';
import Jumbotron from 'components/Home/Jumbotron';
import AddNew from './AddNew';
import { ReactComponent as Logo } from 'assets/img/logo.svg';
import { ReactComponent as LogoWhite } from 'assets/img/logo_white.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import { Cookies } from 'react-cookie';
import Gravatar from 'react-gravatar';
import { useSelector, useDispatch } from 'react-redux';
import Authentication from 'components/Authentication/Authentication';
import SearchForm from './SearchForm';
import { openAuthDialog, updateAuth, resetAuth } from 'slices/authSlice';
import { getUserInformation } from 'services/backend/users';
import greetingTime from 'greeting-time';
import styled, { createGlobalStyle } from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import env from '@beam-australia/react-env';
import { toast } from 'react-toastify';
import HomeBannerBg from 'assets/img/graph-background.svg';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import AboutMenu from 'components/Layout/Header/AboutMenu';
import ContentTypesMenu from 'components/Layout/Header/ContentTypesMenu';
import Nfdi4dsButton from 'components/Layout/Header/Nfdi4dsButton';

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
        .btn:not(.search-icon) {
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

const StyledNavbar = styled(Navbar)`
    &&& {
        &:not(.home-page) {
            box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.13);
            background: white;
        }

        background: transparent;
        border: 0;

        .nav-link {
            color: ${props => props.theme.secondary};

            &:hover {
                color: ${props => props.theme.primary};
            }
        }

        .search-box {
            input {
                border-right: 0;
            }

            .search-icon {
                color: ${props => props.theme.primary};
            }

            button {
                border: 1px solid #ced4da;
                border-left: 0 !important;
                background: ${props => props.theme.inputBg};
            }
        }

        &.home-page {
            & .nav-link {
                color: white;
                &:hover {
                    color: #bbbbbb;
                }
            }
            & .sign-in {
                color: white;
                background: #32303b;
                border-color: #32303b;
                &:hover {
                    color: white;
                    background: #100f13;
                    border-color: #100f13;
                }
            }
            .search-box .search-icon {
                color: ${props => props.theme.secondary};
            }

            @media (max-width: ${props => props.theme.gridBreakpoints.md}) {
                background: #5f6474;
            }
        }
    }
`;

const Header = () => {
    const [isOpenNavBar, setIsOpenNavBar] = useState(false);
    const [isOpenAboutMenu, setIsOpenAboutMenu] = useState(false);
    const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);
    const [userTooltipOpen, setUserTooltipOpen] = useState(false);
    const [logoutTimeoutId, setLogoutTimeoutId] = useState(null);

    const location = useLocation();
    const [isHomePageStyle, setIsHomePageStyle] = useState(location.pathname === ROUTES.HOME ? true : false);
    const user = useSelector(state => state.auth.user);
    const userPopup = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setIsHomePageStyle(location.pathname === ROUTES.HOME ? true : false);
    }, [location.pathname]);

    const toggleUserTooltip = useCallback(() => {
        setUserTooltipOpen(v => !userTooltipOpen);
    }, [userTooltipOpen]);

    useEffect(() => {
        const userInformation = () => {
            const cookies = new Cookies();
            const token = cookies.get('token') ? cookies.get('token') : null;
            const token_expires_in = cookies.get('token_expires_in') ? cookies.get('token_expires_in') : null;
            if (token && !user) {
                getUserInformation()
                    .then(userData => {
                        dispatch(
                            updateAuth({
                                user: {
                                    displayName: userData.display_name,
                                    id: userData.id,
                                    token: token,
                                    tokenExpire: token_expires_in,
                                    email: userData.email,
                                    isCurationAllowed: userData.is_curation_allowed
                                }
                            })
                        );
                    })
                    .catch(error => {
                        cookies.remove('token', { path: env('PUBLIC_URL') });
                        cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
                        dispatch(resetAuth());
                    });
            }
        };

        const handleScroll = () => {
            if (window.pageYOffset > 0) {
                if (isHomePageStyle) {
                    setIsHomePageStyle(false);
                }
            } else {
                if (!isHomePageStyle && location.pathname === ROUTES.HOME) {
                    setIsHomePageStyle(true);
                }
            }
        };

        const handleClickOutside = event => {
            if (userPopup.current && !userPopup.current.contains(event.target) && userTooltipOpen) {
                toggleUserTooltip();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll);
        userInformation();

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
            if (logoutTimeoutId) {
                clearTimeout(logoutTimeoutId); // clear timeout
                setLogoutTimeoutId(null);
            }
        };
    }, [dispatch, isHomePageStyle, location.pathname, logoutTimeoutId, toggleUserTooltip, user, userTooltipOpen]);

    useEffect(() => {
        const tokenExpired = () => {
            toast.warn('User session expired, please sign in again!');
            cookies.remove('token', { path: env('PUBLIC_URL') });
            cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
            dispatch(resetAuth());
            dispatch(openAuthDialog({ action: 'signin' }));
            //logoutTimeoutId = null;
        };
        if (!logoutTimeoutId && user) {
            const token_expires_in = cookies.get('token_expires_in') ? cookies.get('token_expires_in') : null;
            // Get the diffrence between token expiration time and now
            const diff = new Date(token_expires_in) - Date.now();
            // set timeout to autologout
            setLogoutTimeoutId(setTimeout(tokenExpired, diff));
        }
    }, [dispatch, logoutTimeoutId, user]);

    const toggleNavBar = () => {
        setIsOpenNavBar(v => !isOpenNavBar);
    };

    const toggleAboutMenu = () => {
        setIsOpenAboutMenu(v => !isOpenAboutMenu);
    };

    const toggleViewMenu = () => {
        setIsOpenViewMenu(v => !isOpenViewMenu);
    };

    const closeMenu = () => {
        setIsOpenViewMenu(false);
        setIsOpenNavBar(false);
        setIsOpenAboutMenu(false);
    };

    const handleSignOut = () => {
        dispatch(resetAuth());
        const cookies = new Cookies();
        cookies.remove('token', { path: env('PUBLIC_URL') });
        cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
        toggleUserTooltip();
        navigate('/', { state: { signedOut: true } });
    };

    const requireAuthentication = (e, redirectRoute) => {
        if (!user) {
            dispatch(openAuthDialog({ action: 'signin', signInRequired: true, redirectRoute }));
            // Don't follow the link when user is not authenticated
            e.preventDefault();
        } else {
            toggleNavBar();
        }
    };

    const email = user && user.email ? user.email : 'example@example.com';
    const greeting = greetingTime(new Date());
    const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;

    const navbarClasses = `
            ${isHomePageStyle ? 'home-page' : ''}
            ${isHomePageStyle && isOpenNavBar ? 'shadow' : ''}
        `;

    return (
        <StyledTopBar className={isHomePageStyle ? 'home-page' : ''}>
            <StyledNavbar
                light={!isHomePageStyle}
                dark={isHomePageStyle}
                className={navbarClasses}
                expand="md"
                fixed="top"
                id="main-navbar"
                container={!isHomePageStyle ? true : 'sm'}
                style={{ display: 'flex', width: '100%', transition: 'width 1s ease-in-out' }}
            >
                <GlobalStyle scrollbarWidth={scrollbarWidth(true)} cookieInfoDismissed={cookieInfoDismissed} />

                <StyledLink to={ROUTES.HOME} className="me-4 p-0" onClick={closeMenu}>
                    {!isHomePageStyle && <Logo />}
                    {isHomePageStyle && <LogoWhite />}
                </StyledLink>

                <NavbarToggler onClick={toggleNavBar} />

                <Collapse isOpen={isOpenNavBar} navbar>
                    <Nav className="me-auto flex-shrink-0" navbar>
                        {/* view menu */}
                        <ButtonDropdown nav isOpen={isOpenViewMenu} toggle={toggleViewMenu}>
                            <DropdownToggle nav className="ms-2">
                                View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.COMPARISONS} onClick={closeMenu}>
                                    Comparisons
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.PAPERS} onClick={closeMenu}>
                                    Papers
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.VISUALIZATIONS} onClick={closeMenu}>
                                    Visualizations
                                </DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.REVIEWS}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                >
                                    Reviews{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.LISTS}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                >
                                    Lists{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.BENCHMARKS} onClick={closeMenu}>
                                    Benchmarks
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.RESEARCH_FIELDS} onClick={closeMenu}>
                                    Research fields
                                </DropdownItem>

                                <ContentTypesMenu closeMenu={closeMenu} />

                                <DropdownItem divider />
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.OBSERVATORIES}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                >
                                    Observatories{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.ORGANIZATIONS}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                >
                                    Organizations{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem divider />

                                <DropdownItem header>Advanced views</DropdownItem>

                                <DropdownItem tag={RouterNavLink} end to={ROUTES.RESOURCES} onClick={closeMenu}>
                                    Resources
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.PROPERTIES} onClick={closeMenu}>
                                    Properties
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.CLASSES} onClick={closeMenu}>
                                    Classes
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>

                        {/* tools menu */}
                        <ButtonDropdown nav>
                            <DropdownToggle nav className="ms-2">
                                Tools <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.TOOLS} onClick={closeMenu}>
                                    Tools overview
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem header>Data entry</DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.CONTRIBUTION_EDITOR}
                                    onClick={e => requireAuthentication(e, ROUTES.CONTRIBUTION_EDITOR)}
                                >
                                    Contribution editor
                                </DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.CSV_IMPORT}
                                    onClick={e => requireAuthentication(e, ROUTES.CSV_IMPORT)}
                                >
                                    CSV import
                                </DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={ROUTES.PDF_ANNOTATION}
                                    onClick={e => requireAuthentication(e, ROUTES.PDF_ANNOTATION)}
                                >
                                    Survey table import
                                </DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.TEMPLATES} onClick={closeMenu}>
                                    Templates
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem header>Data export</DropdownItem>
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.DATA} onClick={closeMenu}>
                                    Data Access
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>

                        {/* about menu */}
                        <ButtonDropdown isOpen={isOpenAboutMenu} toggle={toggleAboutMenu} nav>
                            <DropdownToggle nav className="ms-2" onClick={toggleAboutMenu}>
                                About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <AboutMenu closeMenu={closeMenu} />
                                <DropdownItem divider />
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.HELP_CENTER} onClick={closeMenu}>
                                    Help center
                                </DropdownItem>
                                <DropdownItem
                                    tag="a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/"
                                    onClick={closeMenu}
                                >
                                    GitLab <Icon size="sm" icon={faExternalLinkAlt} />
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem tag={RouterNavLink} end to={ROUTES.STATS} onClick={closeMenu}>
                                    Statistics
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                        <Nfdi4dsButton />
                    </Nav>

                    <SearchForm placeholder="Search..." onSearch={closeMenu} />

                    <AddNew isHomePageStyle={isHomePageStyle} onAdd={closeMenu} />

                    {!!user && (
                        <div className="ms-2">
                            <StyledGravatar className="rounded-circle" email={email} size={40} id="TooltipExample" />
                            <StyledAuthTooltip
                                fade={false}
                                trigger="click"
                                innerClassName="pe-3 ps-3 pt-3 pb-3 clearfix"
                                placement="bottom-end"
                                isOpen={userTooltipOpen}
                                target="TooltipExample"
                                toggle={toggleUserTooltip}
                                innerRef={userPopup}
                            >
                                <Row>
                                    <div className="col-3 text-center">
                                        <Link onClick={toggleUserTooltip} to={reverse(ROUTES.USER_PROFILE, { userId: user.id })}>
                                            <StyledGravatar
                                                className="rounded-circle"
                                                style={{ border: '3px solid #fff' }}
                                                email={email}
                                                size={76}
                                                id="TooltipExample"
                                            />
                                        </Link>
                                    </div>
                                    <div className="col-9 text-start">
                                        <span className="ms-1">
                                            {greeting} {user.displayName}
                                        </span>
                                        <ButtonGroup className="mt-2" size="sm">
                                            <Button
                                                color="secondary"
                                                onClick={toggleUserTooltip}
                                                tag={Link}
                                                to={reverse(ROUTES.USER_PROFILE, { userId: user.id })}
                                            >
                                                Profile
                                            </Button>
                                            <Button
                                                color="secondary"
                                                className="text-nowrap"
                                                onClick={toggleUserTooltip}
                                                tag={Link}
                                                to={reverse(ROUTES.USER_SETTINGS_DEFAULT)}
                                            >
                                                My account
                                            </Button>
                                            <Button onClick={handleSignOut} className="text-nowrap">
                                                Sign out
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </Row>
                            </StyledAuthTooltip>
                        </div>
                    )}

                    {!!!user && (
                        <Button
                            color="secondary"
                            className="ps-4 pe-4 flex-shrink-0 sign-in"
                            outline
                            onClick={() => dispatch(openAuthDialog({ action: 'signin' }))}
                        >
                            <FontAwesomeIcon className="me-1" icon={faUser} /> Sign in
                        </Button>
                    )}
                </Collapse>

                <Authentication />
            </StyledNavbar>

            {location.pathname === ROUTES.HOME && <Jumbotron />}
        </StyledTopBar>
    );
};

export default Header;
