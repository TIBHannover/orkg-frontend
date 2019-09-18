import React, { Component } from 'react';
import '../../assets/scss/DefaultLayout.scss';
import { ToastContainer, Slide } from 'react-toastify';
import { popupDelay } from '../../utils';
import Header from './Header/Header';
import Footer from './Footer';

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
            <div className="body">
                <ToastContainer
                    position="top-right"
                    autoClose={parseInt(popupDelay)}
                    hideProgressBar
                    transition={Slide}
                />

                <Header />
                {this.props.children}
                <Footer />
            </div>
        );
    }
}

export default DefaultLayout;