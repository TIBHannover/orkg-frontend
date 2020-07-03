import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from './routes.config';
import DefaultLayout from './components/Layout/DefaultLayout';
import './assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ConnectedRouter } from 'connected-react-router';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { detect } from 'detect-browser';
import ScrollToTop from './components/ScrollToTop';

class App extends Component {
    constructor(props) {
        super(props);

        const browser = detect();

        this.state = {
            showBrowserWarning: false
        };

        if (browser && browser.name === 'ie') {
            this.state.showBrowserWarning = true;
        }
    }

    render() {
        return (
            <ConnectedRouter history={this.props.history}>
                <ScrollToTop>
                    <DefaultLayout>
                        {this.state.showBrowserWarning && (
                            <div class="alert alert-danger alert-server" role="alert" style={{ borderRadius: '0' }}>
                                <strong>Outdated browser</strong> You are using Internet Explorer which is not supported. Please upgrade your browser
                                for the best experience
                            </div>
                        )}
                        {process.env.REACT_APP_IS_A_TESTING_SERVER === 'True' && (
                            <div
                                class="alert alert-warning text-center"
                                role="alert"
                                style={{ borderRadius: '0', marginTop: '-30px', marginBottom: '30px' }}
                            >
                                <strong>Warning:</strong> You are using a testing server. Data you enter in the system can be deleted without any
                                notice.
                            </div>
                        )}
                        <Switch>{renderRoutes(routes)}</Switch>
                    </DefaultLayout>
                </ScrollToTop>
            </ConnectedRouter>
        );
    }
}

App.propTypes = {
    history: PropTypes.object
};

export default withCookies(App);
