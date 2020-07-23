import React from 'react';
import 'assets/scss/DefaultLayout.scss';
import { ToastContainer, Slide } from 'react-toastify';
import Header from 'components/Layout/Header/Header';
import Footer from 'components/Layout/Footer';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import ROUTES from 'constants/routes';

const StyledBody = styled.div`
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    padding-top: 73px;
    margin-top: 30px;
`;

const StyledAppContent = styled.div`
    flex: 1 0 auto;
`;

const StyledFooter = styled.div`
    flex-shrink: 0;
`;

function CloseToastButton({ closeToast }) {
    return (
        <span
            onClick={e => {
                e.stopPropagation();
                closeToast(e);
            }}
        >
            <Icon icon={faTimes} />
        </span>
    );
}
CloseToastButton.propTypes = {
    closeToast: PropTypes.func
};

export default function DefaultLayout(props) {
    const location = useLocation();
    const showFooter = location.pathname !== ROUTES.PDF_ANNOTATION;

    return (
        <StyledBody className="body">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar
                transition={Slide}
                className="toast-container"
                closeButton={<CloseToastButton />}
            />
            <Header />
            <StyledAppContent>{props.children}</StyledAppContent>
            {showFooter && (
                <StyledFooter>
                    <Footer />
                </StyledFooter>
            )}
        </StyledBody>
    );
}

DefaultLayout.propTypes = {
    children: PropTypes.array.isRequired
};
