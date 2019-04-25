import React, { Component } from 'react';
import '../../assets/scss/DefaultLayout.scss';
import { NotificationContainer } from 'react-notifications';
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
                <NotificationContainer />

                <Header />
                {this.props.children}
                <Footer />
            </div>
        );
    }
}

export default DefaultLayout;