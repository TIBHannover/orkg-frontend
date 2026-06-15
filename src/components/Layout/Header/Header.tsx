'use client';

import { faExternalLinkAlt, faSpinner, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { match } from 'path-to-regexp';
import { useEffect, useState } from 'react';
import { useMountedState, useWindowScroll } from 'react-use';

import Logo from '@/assets/img/logo.svg';
import LogoWhite from '@/assets/img/logo_white.svg';
import Jumbotron from '@/components/Home/Jumbotron';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddNew from '@/components/Layout/Header/AddNew';
import AboutDropdown from '@/components/Layout/Header/Menu/AboutDropdown';
import ToolsDropdown from '@/components/Layout/Header/Menu/ToolsDropdown';
import ViewDropdown from '@/components/Layout/Header/Menu/ViewDropdown';
import Nfdi4dsButton from '@/components/Layout/Header/Nfdi4dsButton';
import NotificationsBell from '@/components/Layout/Header/NotificationsBell/NotificationsBell';
import SearchForm from '@/components/Layout/Header/SearchForm';
import StyledTopBar from '@/components/Layout/Header/styled';
import ThemeSwitcher from '@/components/Layout/Header/ThemeSwitcher';
import UserTooltip from '@/components/Layout/Header/UserTooltip';
import ROUTES from '@/constants/routes';

const Header = () => {
    const { user, status } = useAuthentication();
    const [isOpenNavBar, setIsOpenNavBar] = useState(false);

    const isMounted = useMountedState();
    const { y: scrollPosition } = useWindowScroll();
    const pathname = usePathname();

    const closeMenu = () => setIsOpenNavBar(false);

    const isHomePage = pathname === ROUTES.HOME || !!match(ROUTES.HOME_WITH_RESEARCH_FIELD)(pathname);
    const isTransparentNavbar = isMounted() ? isHomePage && scrollPosition === 0 : true;

    useEffect(() => {
        if (!isOpenNavBar) {
            return undefined;
        }
        const mq = window.matchMedia('(max-width: 767px)');
        const sync = () => {
            document.body.style.overflow = mq.matches ? 'hidden' : '';
        };
        sync();
        mq.addEventListener('change', sync);
        return () => {
            mq.removeEventListener('change', sync);
            document.body.style.overflow = '';
        };
    }, [isOpenNavBar]);

    const shellNavClass = cn(
        /* Above home main column (pageClient Row z-99); Jumbotron stays in-flow below this bar */
        'fixed top-0 z-[1030] w-full border-b transition-colors',
        isTransparentNavbar
            ? 'border-transparent bg-transparent'
            : 'border-separator bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.13)] backdrop-blur-lg',
    );

    const innerClass = 'mx-auto flex h-[72px] w-full max-w-container items-center gap-3 px-3';
    const desktopOnlyRow = 'hidden md:flex md:flex-1 md:items-center md:justify-between md:gap-4';
    const mobilePanelClass = cn(
        'flex max-h-[calc(100dvh-72px)] flex-col gap-3 overflow-y-auto border-t border-separator py-3 md:hidden',
        isOpenNavBar ? 'flex' : 'hidden',
    );

    const askLinkClass = cn(
        'navlink-ask inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-medium max-[1200px]:hidden',
        isTransparentNavbar ? 'text-white hover:text-neutral-200' : 'text-foreground hover:text-accent',
    );

    return (
        <StyledTopBar className={isHomePage ? 'home-page' : ''}>
            <nav className={shellNavClass} id="main-navbar">
                <div className={innerClass}>
                    <button
                        type="button"
                        className={cn(
                            'inline-flex size-10 shrink-0 items-center justify-center rounded-md md:hidden',
                            isTransparentNavbar ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-default/40',
                        )}
                        aria-label={isOpenNavBar ? 'Close menu' : 'Open menu'}
                        aria-expanded={isOpenNavBar}
                        onClick={() => setIsOpenNavBar((v) => !v)}
                    >
                        {isOpenNavBar ? (
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>

                    <Link
                        href={ROUTES.HOME}
                        className="relative mr-2 shrink-0 p-0 md:mr-4"
                        onClick={closeMenu}
                        style={{ color: isTransparentNavbar ? '#545a71' : '#EF815E' }}
                    >
                        {!isTransparentNavbar ? (
                            <Image src={Logo} alt="Logo ORKG" priority />
                        ) : (
                            <Image src={LogoWhite} alt="Logo ORKG in light colors" priority />
                        )}
                    </Link>

                    <div className={desktopOnlyRow}>
                        <ul className="flex list-none flex-wrap items-center gap-1">
                            <li id="tour-views" className="flex">
                                <ViewDropdown isTransparentNavbar={isTransparentNavbar} />
                            </li>
                            <li className="flex">
                                <ToolsDropdown isTransparentNavbar={isTransparentNavbar} />
                            </li>
                            <li id="about" className="flex">
                                <AboutDropdown isTransparentNavbar={isTransparentNavbar} />
                            </li>
                            <li>
                                <a href="https://ask.orkg.org" target="_blank" rel="noreferrer" className={askLinkClass}>
                                    ORKG Ask
                                    <FontAwesomeIcon className="size-3 opacity-80" icon={faExternalLinkAlt} />
                                </a>
                            </li>
                            <li className="flex list-none items-center">
                                <Nfdi4dsButton />
                            </li>
                        </ul>

                        <div className="flex min-w-0 items-center justify-end gap-2">
                            <SearchForm placeholder="Search..." onSearch={closeMenu} />
                            <AddNew isHomePageStyle={isTransparentNavbar} onAdd={closeMenu} />
                            <ThemeSwitcher isTransparentNavbar={isTransparentNavbar} />
                            {status === 'authenticated' && user && <NotificationsBell isTransparentNavbar={isTransparentNavbar} />}
                            {status === 'authenticated' && user && <UserTooltip />}
                            {status === 'unauthenticated' && (
                                <Button
                                    id="sign-in"
                                    className={cn(
                                        'sign-in shrink-0 px-4',
                                        isTransparentNavbar &&
                                            'border-[#32303b] bg-[#32303b] text-white hover:border-[#100f13] hover:bg-[#100f13] hover:text-white',
                                    )}
                                    variant={isTransparentNavbar ? 'primary' : 'secondary'}
                                    onPress={() => signIn('keycloak')}
                                >
                                    <FontAwesomeIcon className="mr-1" icon={faUser} />
                                    <span className="hidden sm:inline lg:inline">Sign in</span>
                                </Button>
                            )}
                            {status === 'loading' && (
                                <div className="relative ml-2 mr-1">
                                    <FontAwesomeIcon
                                        className="text-xl"
                                        style={isTransparentNavbar ? { color: 'white' } : undefined}
                                        icon={faSpinner}
                                        spin
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={cn(mobilePanelClass, isTransparentNavbar && 'bg-[#5f6474]')}
                    onClickCapture={(e) => {
                        if ((e.target as HTMLElement).closest('a[href]')) {
                            closeMenu();
                        }
                    }}
                >
                    <div className="flex flex-col gap-1 px-4">
                        <ViewDropdown isTransparentNavbar={isTransparentNavbar} fullWidthMobile />
                        <ToolsDropdown isTransparentNavbar={isTransparentNavbar} fullWidthMobile />
                        <AboutDropdown isTransparentNavbar={isTransparentNavbar} fullWidthMobile />
                        <a
                            href="https://ask.orkg.org"
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                                'inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium min-[1201px]:hidden',
                                isTransparentNavbar ? 'text-white hover:bg-white/10' : 'text-foreground hover:bg-default/40',
                            )}
                        >
                            ORKG Ask
                            <FontAwesomeIcon className="size-3 opacity-80" icon={faExternalLinkAlt} />
                        </a>
                        <Nfdi4dsButton />
                        <div
                            className={cn(
                                'inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium',
                                isTransparentNavbar ? 'text-white' : 'text-foreground',
                            )}
                        >
                            <ThemeSwitcher isTransparentNavbar={isTransparentNavbar} />
                            <span>Toggle theme</span>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-2 border-t border-separator px-4 pt-3">
                        <SearchForm placeholder="Search..." onSearch={closeMenu} />
                        <AddNew isHomePageStyle={isTransparentNavbar} onAdd={closeMenu} />
                        {status === 'authenticated' && user && (
                            <div
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium',
                                    isTransparentNavbar ? 'text-white' : 'text-foreground',
                                )}
                            >
                                <NotificationsBell isTransparentNavbar={isTransparentNavbar} />
                                <span>Notifications</span>
                            </div>
                        )}
                        {status === 'authenticated' && user && <UserTooltip />}
                        {status === 'unauthenticated' && (
                            <Button
                                id="sign-in-mobile"
                                className={cn(
                                    'sign-in w-full',
                                    isTransparentNavbar &&
                                        'border-[#32303b] bg-[#32303b] text-white hover:border-[#100f13] hover:bg-[#100f13] hover:text-white',
                                )}
                                variant={isTransparentNavbar ? 'primary' : 'secondary'}
                                onPress={() => signIn('keycloak')}
                            >
                                <FontAwesomeIcon className="mr-1" icon={faUser} />
                                Sign in
                            </Button>
                        )}
                        {status === 'loading' && (
                            <div className="flex justify-center py-2">
                                <FontAwesomeIcon
                                    className="text-xl"
                                    style={isTransparentNavbar ? { color: 'white' } : undefined}
                                    icon={faSpinner}
                                    spin
                                />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {isHomePage && <Jumbotron />}
        </StyledTopBar>
    );
};

export default Header;
