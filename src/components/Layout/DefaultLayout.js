import { useState } from 'react';
import 'assets/scss/DefaultLayout.scss';
import { ToastContainer, Slide } from 'react-toastify';
import { Alert, Button } from 'reactstrap';
import { useCookies } from 'react-cookie';
import Header from 'components/Layout/Header/Header';
import Footer from 'components/Layout/Footer';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import useOnLocationChange from 'components/Layout/hooks/useOnLocationChange';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import ROUTES from 'constants/routes';
import env from '@beam-australia/react-env';

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

const CloseToastButton = ({ closeToast }) => {
    return (
        <span
            onClick={e => {
                e.stopPropagation();
                closeToast(e);
            }}
            onKeyDown={e => {
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
};

CloseToastButton.propTypes = {
    closeToast: PropTypes.func
};

export default function DefaultLayout(props) {
    const location = useLocation();
    const showFooter = location.pathname !== ROUTES.PDF_TEXT_ANNOTATION && location.pathname !== ROUTES.PDF_ANNOTATION;
    const [cookies, setCookie] = useCookies(['cookieInfoDismissed']);
    const [visible, setVisible] = useState(!Boolean(cookies.cookieInfoDismissed));
    const { trackPageView } = useMatomo();

    const onDismissCookieInfo = () => {
        setCookie('cookieInfoDismissed', true, { path: env('PUBLIC_URL'), maxAge: 365 * 24 * 60 * 60 * 1000 });
        setVisible(false);
    };

    useOnLocationChange(() =>
        setTimeout(function() {
            // Track page view
            trackPageView();
        }, 1000)
    );

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
            <StyledAppContent>{props.children}</StyledAppContent>
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
    children: PropTypes.array.isRequired
};
