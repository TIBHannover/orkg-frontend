import React, { Component } from 'react';
import '../../assets/scss/DefaultLayout.scss';
import { ToastContainer, Slide } from 'react-toastify';
import { popupDelay } from '../../utils';
import Header from './Header/Header';
import Footer from './Footer';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledBody = styled.div`
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    padding-top: 100px;
`

const StyledAppContent = styled.div`
    flex: 1 0 auto;
`

const StyledFooter = styled.div`
    flex-shrink: 0;
`

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
                    autoClose={parseInt(popupDelay)}
                    hideProgressBar
                    transition={Slide}
                />

                <Header />
                <StyledAppContent>
                    {this.props.children}
                </StyledAppContent>
                <StyledFooter>
                    <Footer />
                </StyledFooter>
            </StyledBody>
        );
    }
}

DefaultLayout.propTypes = {
    children: PropTypes.array.isRequired,
};

export default DefaultLayout;