'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@jonkoops/matomo-tracker-react';
import 'assets/scss/DefaultLayout.scss';
import Footer from 'components/Layout/Footer';
import Header from 'components/Layout/Header/Header';
import env from 'components/NextJsMigration/env';
import usePathname from 'components/NextJsMigration/usePathname';
import ROUTES from 'constants/routes';
import { detect } from 'detect-browser';
import PropTypes from 'prop-types';
import { Suspense, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Helmet } from 'react-helmet';
import { Slide, ToastContainer } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import styled from 'styled-components';

const StyledBody = styled.div`
    display: flex;
    min-height: calc(100vh);
    flex-direction: column;
`;

const StyledAppContent = styled.div`
    flex: 1 0 auto;
    padding-top: 30px;
`;

const StyledFooter = styled.div`
    flex-shrink: 0;
`;

const ToastContainerStyled = styled.div`
    // REACT-TOASTIFY
    .toast-container {
        pointer-events: auto;
        .Toastify__toast {
            border-radius: 11px;
            padding-left: 15px;
            padding-right: 15px;
        }
    }
`;

const StyledAlertCookie = styled(Alert)`
    &&& {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        margin: 0 !important;
        z-index: 2147483647;
        opacity: 0;
        visibility: hidden;
        border-radius: 0;
        transform: translateY(100%);
        transition: all 300ms ease-out;
        background: #202226;
        border: 0;
        color: #fff;

        &.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0%);
            transition-delay: 1000ms;
        }

        & a {
            text-decoration: underline;
        }
    }
`;

const CloseToastButton = ({ closeToast }) => (
    <span
        onClick={(e) => {
            e.stopPropagation();
            closeToast(e);
        }}
        onKeyDown={(e) => {
            if (e.keyCode === 13) {
                e.stopPropagation();
                closeToast(e);
            }
        }}
        role="button"
        tabIndex={0}
    >
        <Icon icon={faTimes} />
    </span>
);

CloseToastButton.propTypes = {
    closeToast: PropTypes.func,
};

export default function DefaultLayout(props) {
    const pathname = usePathname();
    const showFooter = pathname !== ROUTES.PDF_TEXT_ANNOTATION && pathname !== ROUTES.PDF_ANNOTATION;
    const [cookies, setCookie] = useCookies(['cookieInfoDismissed']);
    const [visible, setVisible] = useState(false);
    const { trackPageView } = useMatomo();
    const browser = detect();
    const showBrowserWarning = browser && browser.name === 'ie';

    const alertStyle = { borderRadius: 0, zIndex: 1000, marginBottom: 0 };

    const onDismissCookieInfo = () => {
        setCookie('cookieInfoDismissed', true, { path: env('NEXT_PUBLIC_PUBLIC_URL'), maxAge: 365 * 24 * 60 * 60 * 1000 });
        setVisible(false);
    };

    useEffect(() => {
        setTimeout(() => {
            // Track page view
            trackPageView();
        }, 1000);
    }, [pathname, trackPageView]);

    useEffect(() => {
        setVisible(!cookies.cookieInfoDismissed);
    }, [cookies.cookieInfoDismissed]);

    useEffect(() => {
        if (env('NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN')) {
            // eslint-disable-next-line wrap-iife
            ((d, t) => {
                const BASE_URL = 'https://app.chatwoot.com';
                const g = d.createElement(t);
                const s = d.getElementsByTagName(t)[0];
                g.src = `${BASE_URL}/packs/js/sdk.js`;
                s.parentNode.insertBefore(g, s);
                g.onload = () => {
                    window.chatwootSDK.run({
                        websiteToken: env('NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN'),
                        baseUrl: BASE_URL,
                    });
                };
            })(document, 'script');
        }
    }, []);

    return (
        <StyledBody className="body">
            <ToastContainerStyled>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar
                    transition={Slide}
                    className="toast-container"
                    icon={false}
                    theme="colored"
                    closeButton={<CloseToastButton />}
                />
            </ToastContainerStyled>
            <Header />
            {showBrowserWarning && (
                <Alert color="danger" style={alertStyle} className="text-center">
                    <strong>Outdated browser</strong> You are using Internet Explorer which is not supported. Please upgrade your browser for the best
                    experience
                </Alert>
            )}
            {env('NEXT_PUBLIC_IS_TESTING_SERVER') === 'true' && (
                <>
                    <Helmet>
                        <meta name="robots" content="noindex" /> {/* make sure search engines are not indexing our test server */}
                    </Helmet>
                    <Alert color="warning" style={alertStyle} className="text-center" fade={false}>
                        <strong>Warning:</strong> You are using a testing environment. Data you enter in the system can be deleted without any notice.
                    </Alert>
                </>
            )}
            <Suspense fallback={<div className="mt-5 mb-2 text-center">Loading...</div>}>
                <StyledAppContent>{props.children}</StyledAppContent>
            </Suspense>
            {showFooter && (
                <StyledFooter>
                    <Footer />
                </StyledFooter>
            )}
            <StyledAlertCookie id="alertCookie" color="info" isOpen={visible} className="d-flex justify-content-center align-items-center">
                This website uses cookies to ensure you get the best experience on our website. By using this site, you agree to this use.
                <a href="https://projects.tib.eu/orkg/data-protection/" target="_blank" rel="noopener noreferrer" className="mx-2">
                    More Info
                </a>
                <Button onClick={onDismissCookieInfo} color="primary" className="btn-sm mx-2">
                    OK
                </Button>
            </StyledAlertCookie>
        </StyledBody>
    );
}

DefaultLayout.propTypes = {
    children: PropTypes.object.isRequired,
};
