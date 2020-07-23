import React, { Component } from 'react';
import 'assets/scss/DefaultLayout.scss';
import { ToastContainer, Slide } from 'react-toastify';
import Header from './Header/Header';
import Footer from './Footer';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

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

class DefaultLayout extends Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    render() {
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
                <StyledAppContent>{this.props.children}</StyledAppContent>
                <StyledFooter>
                    <Footer />
                </StyledFooter>
            </StyledBody>
        );
    }
}

DefaultLayout.propTypes = {
    children: PropTypes.array.isRequired
};

export default DefaultLayout;
