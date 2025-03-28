'use client';

import { faChevronDown, faExternalLinkAlt, faGift, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { scrollbarWidth } from '@xobotyi/scrollbar-width';
import { reverse } from 'named-urls';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { env } from 'next-runtime-env';
import { match } from 'path-to-regexp';
import { MouseEvent, useState } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import { Cookies } from 'react-cookie';
import { useMountedState, useWindowScroll } from 'react-use';
import {
    Badge,
    Button,
    Collapse,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Nav,
    NavbarToggler,
    NavItem,
    NavLink,
    UncontrolledButtonDropdown as ButtonDropdown,
} from 'reactstrap';

import Logo from '@/assets/img/birthday/logo.svg';
import LogoWhite from '@/assets/img/birthday/logo_white.svg';
import Jumbotron from '@/components/Home/Jumbotron';
import useAuthentication from '@/components/hooks/useAuthentication';
import AboutMenu from '@/components/Layout/Header/AboutMenu';
import AddNew from '@/components/Layout/Header/AddNew';
import ContentTypesMenu from '@/components/Layout/Header/ContentTypesMenu';
import Nfdi4dsButton from '@/components/Layout/Header/Nfdi4dsButton';
import SearchForm from '@/components/Layout/Header/SearchForm';
import { GlobalStyle, StyledNavbar, StyledTopBar } from '@/components/Layout/Header/styled';
import UserTooltip from '@/components/Layout/Header/UserTooltip';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';

const cookies = new Cookies();

const Header = () => {
    const { user, status } = useAuthentication();
    const [isOpenNavBar, setIsOpenNavBar] = useState(false);
    const [isOpenAboutMenu, setIsOpenAboutMenu] = useState(false);
    const [isOpenViewMenu, setIsOpenViewMenu] = useState(false);
    const [isExploding, setIsExploding] = useState(false);

    const isMounted = useMountedState();
    const { y: scrollPosition } = useWindowScroll();
    const pathname = usePathname();

    const toggleNavBar = () => setIsOpenNavBar((v) => !v);

    const toggleAboutMenu = () => setIsOpenAboutMenu((v) => !v);

    const toggleViewMenu = () => setIsOpenViewMenu((v) => !v);

    const closeMenu = () => {
        setIsOpenViewMenu(false);
        setIsOpenNavBar(false);
        setIsOpenAboutMenu(false);
    };

    const requireAuthentication = (e: MouseEvent<HTMLElement>, redirectRoute: string) => {
        if (!user) {
            const redirectUri = `${env('NEXT_PUBLIC_URL')}${redirectRoute}`;
            signIn('keycloak', { callbackUrl: redirectUri });
            // Don't follow the link when user is not authenticated
            e.preventDefault();
        } else {
            toggleNavBar();
        }
    };

    const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;
    const isHomePage = pathname === ROUTES.HOME || !!match(ROUTES.HOME_WITH_RESEARCH_FIELD)(pathname);
    const isTransparentNavbar = isMounted() ? isHomePage && scrollPosition === 0 : true;

    return (
        <StyledTopBar className={isHomePage ? 'home-page' : ''}>
            <StyledNavbar
                {...(isTransparentNavbar ? { light: false, dark: true } : { light: true, dark: false })}
                expand="md"
                fixed="top"
                transparent={isTransparentNavbar.toString()}
                id="main-navbar"
                container={!isTransparentNavbar ? true : 'sm'}
            >
                <GlobalStyle $scrollbarWidth={scrollbarWidth(true)} $cookieInfoDismissed={cookieInfoDismissed} />

                <Link
                    href={ROUTES.HOME}
                    className="me-4 p-0 position-relative"
                    onClick={closeMenu}
                    style={{ color: isTransparentNavbar ? '#545a71' : '#EF815E' }}
                >
                    {!isTransparentNavbar ? <Image src={Logo} alt="Logo ORKG" /> : <Image src={LogoWhite} alt="Logo ORKG in light colors" />}
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
                            <FontAwesomeIcon icon={faGift} size="sm" /> 5 years
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
                                        id: ORGANIZATIONS_TYPES.find((o) => o.id === ORGANIZATIONS_MISC.GENERAL)?.label,
                                    })}
                                    onClick={closeMenu}
                                >
                                    Organizations
                                </DropdownItem>
                                <DropdownItem
                                    tag={Link}
                                    href={reverse(ROUTES.ORGANIZATIONS, {
                                        id: ORGANIZATIONS_TYPES.find((o) => o.id === ORGANIZATIONS_MISC.EVENT)?.label,
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
                                <DropdownItem tag={Link} href={ROUTES.RS_STATEMENTS} onClick={closeMenu} active={pathname === ROUTES.RS_STATEMENTS}>
                                    Statements{' '}
                                    <small className="ms-2">
                                        <Badge color="info">Beta</Badge>
                                    </small>
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
                                <DropdownItem tag={Link} href={ROUTES.RS_TEMPLATES} onClick={closeMenu} active={pathname === ROUTES.RS_TEMPLATES}>
                                    Statement types
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
                            <DropdownToggle className="ms-2 nav-link bg-transparent border-0 text-start">
                                About <FontAwesomeIcon style={{ marginTop: '4px' }} icon={faChevronDown} pull="right" />
                            </DropdownToggle>
                            <DropdownMenu>
                                <AboutMenu closeMenu={closeMenu} />
                                <DropdownItem divider />
                                <DropdownItem tag={Link} href={ROUTES.HELP_CENTER} onClick={closeMenu} active={pathname === ROUTES.HELP_CENTER}>
                                    Help center
                                </DropdownItem>
                                <DropdownItem tag="a" href="https://academy.orkg.org" target="_blank" rel="noreferrer">
                                    Academy
                                </DropdownItem>
                                <DropdownItem
                                    tag="a"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/"
                                    onClick={closeMenu}
                                >
                                    GitLab <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                                </DropdownItem>
                                <DropdownItem divider />
                                <DropdownItem tag={Link} href={ROUTES.STATS} onClick={closeMenu} active={pathname === ROUTES.STATS}>
                                    Statistics
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                        <NavItem>
                            <NavLink active href="https://ask.orkg.org" rel="noreferrer" target="_blank" className="navlink-ask">
                                ORKG Ask <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-1" />
                            </NavLink>
                        </NavItem>
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

                    {status === 'authenticated' && user && <UserTooltip />}

                    {status === 'unauthenticated' && (
                        <Button
                            id="sign-in"
                            color="secondary"
                            className="px-3 flex-shrink-0 sign-in d-flex align-items-center justify-content-center"
                            outline
                            onClick={() => signIn('keycloak')}
                        >
                            <FontAwesomeIcon className="me-1" icon={faUser} />
                            <span className="d-md-none d-sm-block d-lg-block">Sign in</span>
                        </Button>
                    )}

                    {status === 'loading' && (
                        <div className="ms-2 me-1 position-relative">
                            <FontAwesomeIcon {...(isTransparentNavbar ? { color: 'white' } : {})} size="xl" icon={faSpinner} spin />
                        </div>
                    )}
                </Collapse>
            </StyledNavbar>

            {isHomePage && <Jumbotron />}
        </StyledTopBar>
    );
};

export default Header;
