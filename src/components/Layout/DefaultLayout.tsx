'use client';

import { Alert, Button, cn, Toast } from '@heroui/react';
import { detect } from 'detect-browser';
import { usePathname } from 'next/navigation';
import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import { Suspense, useEffect, useState } from 'react';

import ComparisonPopup from '@/components/ComparisonPopup/ComparisonPopup';
import Footer from '@/components/Layout/Footer';
import Header from '@/components/Layout/Header/Header';
import ROUTES from '@/constants/routes';
import { isCookieInfoDismissed } from '@/lib/cookieHelpers';

const COOKIE_INFO_DISMISSED = 'cookieInfoDismissed';

const CookieConsentBanner = ({ onDismiss }: { onDismiss: () => void }) => {
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() => setEntered(true), 1000);
        return () => window.clearTimeout(id);
    }, []);

    return (
        <Alert
            id="alertCookie"
            status="accent"
            role="alert"
            className={cn(
                'fixed bottom-0 left-0 z-[2147483647] m-0 w-full rounded-none border-0',
                'bg-[#202226] text-white [&_a]:underline',
                'flex flex-nowrap items-center justify-center gap-2 px-3 py-3',
                'transition-all duration-300 ease-out',
                entered ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0',
            )}
        >
            <Alert.Indicator className="shrink-0 text-white" />
            <Alert.Content className="flex min-w-0 flex-1 items-center justify-center">
                <div className="flex max-w-full min-w-0 flex-nowrap items-center justify-center gap-2 text-center">
                    <span className="min-w-0 shrink text-pretty">
                        This website uses cookies to ensure you get the best experience on our website. By using this site, you agree to this use.
                    </span>
                    <a
                        href="https://projects.tib.eu/orkg/data-protection/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 whitespace-nowrap"
                    >
                        More Info
                    </a>
                    <Button variant="primary" size="sm" className="shrink-0 px-3 py-1.5 text-xs" onPress={onDismiss}>
                        OK
                    </Button>
                </div>
            </Alert.Content>
        </Alert>
    );
};

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const showFooter = pathname !== ROUTES.PDF_ANNOTATION;
    const cookies = useCookies();
    const cookieDismissed = isCookieInfoDismissed(cookies.get(COOKIE_INFO_DISMISSED));
    const [visible, setVisible] = useState(false);
    const browser = detect();
    const showBrowserWarning = browser && browser.name === 'ie';

    const onDismissCookieInfo = () => {
        cookies.set(COOKIE_INFO_DISMISSED, 'true', { path: env('NEXT_PUBLIC_PUBLIC_URL'), expires: 365 });
        setVisible(false);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(!cookieDismissed);
    }, [cookieDismissed]);

    const topBannerClass = 'm-0 shadow';
    const hasTopBanner = showBrowserWarning || env('NEXT_PUBLIC_IS_TESTING_SERVER') === 'true';

    return (
        <div className="flex min-h-screen flex-col gap-y-2">
            <Toast.Provider placement="top end" className="top-[88px]" />
            <Header />
            {hasTopBanner && (
                <div className="flex flex-col gap-2 w-full max-w-container mx-auto px-3">
                    {showBrowserWarning && (
                        <Alert status="danger" role="alert" className={topBannerClass}>
                            <Alert.Indicator />
                            <Alert.Content className="text-center">
                                <Alert.Title>Outdated browser</Alert.Title>
                                <Alert.Description>
                                    You are using Internet Explorer which is not supported. Please upgrade your browser for the best experience.
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}
                    {env('NEXT_PUBLIC_IS_TESTING_SERVER') === 'true' && (
                        <Alert status="warning" role="alert" className={topBannerClass}>
                            <Alert.Indicator />
                            <Alert.Content className="text-center">
                                <Alert.Title>Testing environment</Alert.Title>
                                <Alert.Description>
                                    You are using a testing environment. Data you enter in the system can be deleted without any notice.
                                </Alert.Description>
                            </Alert.Content>
                        </Alert>
                    )}
                </div>
            )}
            <Suspense fallback={<div className="mt-12 mb-2 text-center">Loading...</div>}>
                <main className={`flex-[1_0_auto] ${hasTopBanner ? '' : 'pt-[30px]'}`}>{children}</main>
            </Suspense>
            {showFooter && (
                <div className="shrink-0">
                    <Footer />
                </div>
            )}
            {visible && <CookieConsentBanner onDismiss={onDismissCookieInfo} />}
            <ComparisonPopup />
        </div>
    );
};
export default DefaultLayout;
