import { useState, useEffect } from 'react';
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
    Badge,
} from 'reactstrap';
import { Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import Jumbotron from 'components/Home/Jumbotron';
import { ReactComponent as Logo } from 'assets/img/logo.svg';
import { ReactComponent as LogoWhite } from 'assets/img/logo_white.svg';
import { FontAwesomeIcon, FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faUser, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import { Cookies } from 'react-cookie';
import { useSelector, useDispatch } from 'react-redux';
import Authentication from 'components/Authentication/Authentication';
import { openAuthDialog, updateAuth, resetAuth } from 'slices/authSlice';
import { getUserInformation } from 'services/backend/users';
import styled, { createGlobalStyle } from 'styled-components';
import { reverse } from 'named-urls';
import env from '@beam-australia/react-env';
import { toast } from 'react-toastify';
import HomeBannerBg from 'assets/img/graph-background.svg';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import AboutMenu from 'components/Layout/Header/AboutMenu';
import ContentTypesMenu from 'components/Layout/Header/ContentTypesMenu';
import Nfdi4dsButton from 'components/Layout/Header/Nfdi4dsButton';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from 'constants/organizationsTypes';
import UserTooltip from 'components/Layout/Header/UserTooltip';
import SearchForm from 'components/Layout/Header/SearchForm';
import AddNew from 'components/Layout/Header/AddNew';

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

    &.home-page {
        // For the background
        background: #5f6474 url(${HomeBannerBg});
        background-position-x: 0%, 0%;
        background-position-y: 0%, 0%;
        background-size: auto, auto;
        background-size: cover;
        background-attachment: fixed;
        background-position: center 10%;
        background-repeat: no-repeat;
    }
    position: relative;
`;

const StyledNavbar = styled(Navbar)`
    &&& {
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

        &:not(.transparent-navbar) {
            box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.13);
            background: white;
        }

        &.transparent-navbar {
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
    const [logoutTimeoutId, setLogoutTimeoutId] = useState(null);
    const location = useLocation();
    const isHomePath = location.pathname === ROUTES.HOME;
    const [isTransparentNavbar, setIsTransparentNavbar] = useState(isHomePath);
    const [isHomePage, setIsHomePage] = useState(isHomePath);
    const user = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    useEffect(() => {
        setIsHomePage(isHomePath);
        setIsTransparentNavbar(isHomePath);
    }, [isHomePath]);

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
                                    token,
                                    tokenExpire: token_expires_in,
                                    email: userData.email,
                                    isCurationAllowed: userData.is_curation_allowed,
                                },
                            }),
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
                if (isTransparentNavbar) {
                    setIsTransparentNavbar(false);
                }
            } else if (!isTransparentNavbar && location.pathname === ROUTES.HOME) {
                setIsTransparentNavbar(true);
            }
        };

        window.addEventListener('scroll', handleScroll);
        userInformation();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (logoutTimeoutId) {
                clearTimeout(logoutTimeoutId); // clear timeout
                setLogoutTimeoutId(null);
            }
        };
    }, [dispatch, isTransparentNavbar, location.pathname, logoutTimeoutId, user]);

    useEffect(() => {
        const tokenExpired = () => {
            toast.warn('User session expired, please sign in again!');
            cookies.remove('token', { path: env('PUBLIC_URL') });
            cookies.remove('token_expires_in', { path: env('PUBLIC_URL') });
            dispatch(resetAuth());
            dispatch(openAuthDialog({ action: 'signin' }));
            // logoutTimeoutId = null;
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

    const requireAuthentication = (e, redirectRoute) => {
        if (!user) {
            dispatch(openAuthDialog({ action: 'signin', signInRequired: true, redirectRoute }));
            // Don't follow the link when user is not authenticated
            e.preventDefault();
        } else {
            toggleNavBar();
        }
    };

    const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;

    const navbarClasses = `
            ${isTransparentNavbar ? 'transparent-navbar' : ''}
            ${isTransparentNavbar && isOpenNavBar ? 'shadow' : ''}
        `;

    return (
        <StyledTopBar className={isHomePage ? 'home-page' : ''}>
            <StyledNavbar
                light={!isTransparentNavbar}
                dark={isTransparentNavbar}
                className={navbarClasses}
                expand="md"
                fixed="top"
                id="main-navbar"
                container={!isTransparentNavbar ? true : 'sm'}
                style={{ display: 'flex', width: '100%', transition: 'width 1s ease-in-out' }}
            >
                <GlobalStyle scrollbarWidth={scrollbarWidth(true)} cookieInfoDismissed={cookieInfoDismissed} />

                <StyledLink to={ROUTES.HOME} className="me-4 p-0" onClick={closeMenu}>
                    {!isTransparentNavbar && <Logo />}
                    {isTransparentNavbar && <LogoWhite />}
                </StyledLink>

                <NavbarToggler onClick={toggleNavBar} />

                <Collapse isOpen={isOpenNavBar} navbar>
                    <Nav className="me-auto flex-shrink-0" navbar>
                        {/* view menu */}
                        <ButtonDropdown nav isOpen={isOpenViewMenu} toggle={toggleViewMenu} id="tour-views">
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
                                {/** <DropdownItem tag={RouterNavLink} end to={ROUTES.DIAGRAMS} onClick={closeMenu}>
                                    Diagrams
                                </DropdownItem> */}
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
                                    to={reverse(ROUTES.ORGANIZATIONS, {
                                        type: ORGANIZATIONS_TYPES.find(o => o.id === ORGANIZATIONS_MISC.GENERAL).label,
                                    })}
                                    onClick={closeMenu}
                                >
                                    Organizations
                                </DropdownItem>
                                <DropdownItem
                                    tag={RouterNavLink}
                                    end
                                    to={reverse(ROUTES.ORGANIZATIONS, {
                                        type: ORGANIZATIONS_TYPES.find(o => o.id === ORGANIZATIONS_MISC.EVENT).label,
                                    })}
                                    onClick={closeMenu}
                                >
                                    Conferences
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
                        <ButtonDropdown isOpen={isOpenAboutMenu} toggle={toggleAboutMenu} nav id="about">
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

                    <AddNew isHomePageStyle={isTransparentNavbar} onAdd={closeMenu} />

                    {!!user && <UserTooltip />}

                    {!user && (
                        <Button
                            id="sign-in"
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
