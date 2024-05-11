import { faChevronDown, faExternalLinkAlt, faGift, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import HomeBannerBg from 'assets/img/graph-background.svg';
import Logo from 'assets/img/birthday/logo.svg';
import LogoWhite from 'assets/img/birthday/logo_white.svg';
import Authentication from 'components/Authentication/Authentication';
import Jumbotron from 'components/Home/Jumbotron';
import AboutMenu from 'components/Layout/Header/AboutMenu';
import AddNew from 'components/Layout/Header/AddNew';
import ContentTypesMenu from 'components/Layout/Header/ContentTypesMenu';
import Nfdi4dsButton from 'components/Layout/Header/Nfdi4dsButton';
import SearchForm from 'components/Layout/Header/SearchForm';
import UserTooltip from 'components/Layout/Header/UserTooltip';
import Image from 'components/NextJsMigration/Image';
import Link from 'components/NextJsMigration/Link';
import env from 'components/NextJsMigration/env';
import loadImage from 'components/NextJsMigration/loadImage';
import usePathname from 'components/NextJsMigration/usePathname';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { match } from 'path-to-regexp';
import { useEffect, useState } from 'react';
import { Cookies } from 'react-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    Badge,
    Button,
    UncontrolledButtonDropdown as ButtonDropdown,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    Navbar,
    NavbarToggler,
} from 'reactstrap';
import { getUserInformation } from 'services/backend/users';
import { openAuthDialog, resetAuth, updateAuth } from 'slices/authSlice';
import styled, { createGlobalStyle } from 'styled-components';
import ConfettiExplosion from 'react-confetti-explosion';

const cookies = new Cookies();

// determine the scroll bar width and compensate the width when a modal is opened
const GlobalStyle = createGlobalStyle`
    body.modal-open {
        #main-navbar, #paperHeaderBar {
            right: ${(props) => props.$scrollbarWidth}px
        }
        #helpIcon {
            padding-right: ${(props) => props.$scrollbarWidth}px
        }
        .woot-widget-bubble, .woot-widget-holder {
            margin-right: ${(props) => props.$scrollbarWidth}px
        }
    }
    @media (min-width: 481px) and (max-width: 1100px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${(props) => (!props.$cookieInfoDismissed ? '80px' : '14px')}
        }
    }  
    @media (max-width: 480px) {
        .woot-widget-bubble.woot-elements--right{
            bottom: ${(props) => (!props.$cookieInfoDismissed ? '150px' : '14px')}
        }
    }  
    
`;

const StyledTopBar = styled.div`
    @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
        .navbar-collapse {
            margin-top: 0.4rem;
        }
        .nav-item {
            border-top: 1px solid ${(props) => props.theme.light};
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
                border-top-color: ${(props) => props.theme.secondaryDarker};
            }
        }
    }

    margin-bottom: 0;
    padding-top: 72px;

    &.home-page {
        // For the background
        background: #5f6474 url(${loadImage(HomeBannerBg)});
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
            color: ${(props) => props.theme.secondary};

            &:hover {
                color: ${(props) => props.theme.primary};
            }
        }

        .search-box {
            input {
                border-right: 0;
            }

            .search-icon {
                color: ${(props) => props.theme.primary};
            }

            button {
                border: 1px solid #ced4da;
                border-left: 0 !important;
                background: ${(props) => props.theme.inputBg};
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
                color: ${(props) => props.theme.secondary};
            }

            @media (max-width: ${(props) => props.theme.gridBreakpoints.md}) {
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
    const [isExploding, setIsExploding] = useState(false);

    const pathname = usePathname();
    const isHomePath = pathname === ROUTES.HOME || !!match(ROUTES.HOME_WITH_RESEARCH_FIELD)(pathname);
    const [isTransparentNavbar, setIsTransparentNavbar] = useState(isHomePath);
    const [isHomePage, setIsHomePage] = useState(isHomePath);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();

    useEffect(() => {
        setIsHomePage(isHomePath);
        setIsTransparentNavbar(isHomePath);
    }, [isHomePath]);

    useEffect(() => {
        const userInformation = () => {
            const _cookies = new Cookies();
            const token = _cookies.get('token') ? _cookies.get('token') : null;
            const tokenExpiresIn = _cookies.get('token_expires_in') ? _cookies.get('token_expires_in') : null;
            if (token && !user) {
                getUserInformation()
                    .then((userData) => {
                        dispatch(
                            updateAuth({
                                user: {
                                    displayName: userData.display_name,
                                    id: userData.id,
                                    token,
                                    tokenExpire: tokenExpiresIn,
                                    email: userData.email,
                                    isCurationAllowed: userData.is_curation_allowed,
                                    organization_id: userData.organization_id,
                                    observatory_id: userData.observatory_id,
                                },
                            }),
                        );
                    })
                    .catch(() => {
                        _cookies.remove('token', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                        _cookies.remove('token_expires_in', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
                        dispatch(resetAuth());
                    });
            }
        };

        const handleScroll = () => {
            if (window.scrollY > 0) {
                if (isTransparentNavbar) {
                    setIsTransparentNavbar(false);
                }
            } else if (!isTransparentNavbar && isHomePath) {
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
    }, [dispatch, isTransparentNavbar, pathname, logoutTimeoutId, user]);

    useEffect(() => {
        const tokenExpired = () => {
            toast.warn('User session expired, please sign in again!');
            cookies.remove('token', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
            cookies.remove('token_expires_in', { path: env('NEXT_PUBLIC_PUBLIC_URL') });
            dispatch(resetAuth());
            dispatch(openAuthDialog({ action: 'signin' }));
            // logoutTimeoutId = null;
        };
        if (!logoutTimeoutId && user && cookies.get('token_expires_in')) {
            const tokenExpiresIn = cookies.get('token_expires_in');
            // Get the difference between token expiration time and now
            const diff = new Date(tokenExpiresIn) - Date.now();
            // set timeout to auto logout
            setLogoutTimeoutId(setTimeout(tokenExpired, diff));
        }
    }, [dispatch, logoutTimeoutId, user]);

    const toggleNavBar = () => {
        setIsOpenNavBar(!isOpenNavBar);
    };

    const toggleAboutMenu = () => {
        setIsOpenAboutMenu(!isOpenAboutMenu);
    };

    const toggleViewMenu = () => {
        setIsOpenViewMenu(!isOpenViewMenu);
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
                <GlobalStyle $scrollbarWidth={scrollbarWidth(true)} $cookieInfoDismissed={cookieInfoDismissed} />

                <Link
                    href={ROUTES.HOME}
                    className="me-4 p-0 position-relative"
                    onClick={closeMenu}
                    style={{ color: isTransparentNavbar ? '#545a71' : '#EF815E' }}
                >
                    {!isTransparentNavbar && <Image src={Logo} alt="Logo ORKG" />}
                    {isTransparentNavbar && <Image src={LogoWhite} alt="Logo ORKG in light colors" />}
                    {
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <div
                            className="position-absolute"
                            style={{
                                bottom: -3,
                                right: 4,
                                fontSize: '0.85rem',
                                background: isTransparentNavbar ? '#C1C3CA' : '#FBE6E6',
                                padding: '0 10px',
                                borderRadius: '25px',
                                fontWeight: '500',
                                lineHeight: '1.3',
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.nativeEvent.stopImmediatePropagation();
                                setIsExploding(true);
                            }}
                        >
                            <Icon icon={faGift} size="sm" /> 5 years
                        </div>
                    }
                </Link>

                <NavbarToggler onClick={toggleNavBar} />

                <Collapse isOpen={isOpenNavBar} navbar>
                    <Nav className="me-auto flex-shrink-0" navbar>
                        {/* view menu */}
                        <ButtonDropdown isOpen={isOpenViewMenu} toggle={toggleViewMenu} id="tour-views">
                            <DropdownToggle className="ms-2 nav-link bg-transparent border-0 text-start">
                                View <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem tag={Link} href={ROUTES.COMPARISONS} onClick={closeMenu} active={pathname === ROUTES.COMPARISONS}>
                                    Comparisons
                                </DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.PAPERS} onClick={closeMenu} active={pathname === ROUTES.PAPERS}>
                                    Papers
                                </DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.VISUALIZATIONS} onClick={closeMenu} active={pathname === ROUTES.VISUALIZATIONS}>
                                    Visualizations
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.REVIEWS}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                    active={pathname === ROUTES.REVIEWS}
                                >
                                    Reviews{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.LISTS}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                    active={pathname === ROUTES.LISTS}
                                >
                                    Lists{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.BENCHMARKS} onClick={closeMenu} active={pathname === ROUTES.BENCHMARKS}>
                                    Benchmarks
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.RESEARCH_FIELDS}
                                    onClick={closeMenu}
                                    active={pathname === ROUTES.RESEARCH_FIELDS}
                                >
                                    Research fields
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.SUSTAINABLE_DEVELOPMENT_GOALS}
                                    onClick={closeMenu}
                                    active={pathname === ROUTES.SUSTAINABLE_DEVELOPMENT_GOALS}
                                >
                                    Sustainable <br />
                                    development goals
                                </DropdownItem>
                                {/** <DropdownItem tag={Link} to={ROUTES.DIAGRAMS} onClick={closeMenu}>
                                    Diagrams
                                </DropdownItem> */}
                                <ContentTypesMenu closeMenu={closeMenu} />

                                <DropdownItem divider />
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.OBSERVATORIES}
                                    onClick={closeMenu}
                                    className="d-flex justify-content-between"
                                    active={pathname === ROUTES.OBSERVATORIES}
                                >
                                    Observatories{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={reverse(ROUTES.ORGANIZATIONS, {
                                        id: ORGANIZATIONS_TYPES.find((o) => o.id === ORGANIZATIONS_MISC.GENERAL).label,
                                    })}
                                    onClick={closeMenu}
                                >
                                    Organizations
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={reverse(ROUTES.ORGANIZATIONS, {
                                        id: ORGANIZATIONS_TYPES.find((o) => o.id === ORGANIZATIONS_MISC.EVENT).label,
                                    })}
                                    onClick={closeMenu}
                                >
                                    Conferences
                                </DropdownItem>
                                <DropdownItem divider />

                                <DropdownItem header>Advanced views</DropdownItem>

                                <DropdownItem tag={Link} href={ROUTES.RESOURCES} onClick={closeMenu} active={pathname === ROUTES.RESOURCES}>
                                    Resources
                                </DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.PROPERTIES} onClick={closeMenu} active={pathname === ROUTES.PROPERTIES}>
                                    Properties
                                </DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.CLASSES} onClick={closeMenu} active={pathname === ROUTES.CLASSES}>
                                    Classes
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>

                        {/* tools menu */}
                        <ButtonDropdown>
                            <DropdownToggle className="ms-2 nav-link bg-transparent border-0 text-start">
                                Tools <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem tag={Link} href={ROUTES.TOOLS} onClick={closeMenu} active={pathname === ROUTES.TOOLS}>
                                    Tools overview
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem header>Data entry</DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.CONTRIBUTION_EDITOR}
                                    onClick={(e) => requireAuthentication(e, ROUTES.CONTRIBUTION_EDITOR)}
                                    active={pathname === ROUTES.CONTRIBUTION_EDITOR}
                                >
                                    Contribution editor
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.CSV_IMPORT}
                                    onClick={(e) => requireAuthentication(e, ROUTES.CSV_IMPORT)}
                                    active={pathname === ROUTES.CSV_IMPORT}
                                >
                                    CSV import
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={ROUTES.PDF_ANNOTATION}
                                    onClick={(e) => requireAuthentication(e, ROUTES.PDF_ANNOTATION)}
                                    active={pathname === ROUTES.PDF_ANNOTATION}
                                >
                                    Survey table import
                                </DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.TEMPLATES} onClick={closeMenu} active={pathname === ROUTES.TEMPLATES}>
                                    Templates
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem header>Data export</DropdownItem>
                                <DropdownItem tag={Link} href={ROUTES.DATA} onClick={closeMenu} active={pathname === ROUTES.DATA}>
                                    Data access
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>

                        {/* about menu */}
                        <ButtonDropdown isOpen={isOpenAboutMenu} toggle={toggleAboutMenu} id="about">
                            <DropdownToggle className="ms-2 nav-link bg-transparent border-0 text-start" onClick={toggleAboutMenu}>
                                About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <AboutMenu closeMenu={closeMenu} />
                                <DropdownItem divider />
                                <DropdownItem tag={Link} href={ROUTES.HELP_CENTER} onClick={closeMenu} active={pathname === ROUTES.HELP_CENTER}>
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
                                <DropdownItem tag={Link} href={ROUTES.STATS} onClick={closeMenu} active={pathname === ROUTES.STATS}>
                                    Statistics
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                        <Nfdi4dsButton />
                        {isExploding && (
                            <ConfettiExplosion
                                onComplete={() => setIsExploding(false)}
                                zIndex={10000}
                                particleCount={200}
                                colors={['#D4A9E9', '#9DF3C2', '#FDC3B1', '#FEE6A6', '#E86161']}
                            />
                        )}
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

            {isHomePage && <Jumbotron />}
        </StyledTopBar>
    );
};

export default Header;
