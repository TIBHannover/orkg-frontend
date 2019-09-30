import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config'
import routes from './routes.config'
import DefaultLayout from './components/Layout/DefaultLayout';
import './assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import { ConnectedRouter } from 'connected-react-router'
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { detect } from 'detect-browser';

class App extends Component {
    constructor(props) {
        super(props);

        let browser = detect();

        this.state = {
            showBrowserWarning: false,
        }

        if (browser && browser.name === 'ie') {
            this.state.showBrowserWarning = true;
        }
    }
    componentDidMount() {
        // Listen for changes to the current location.
        this.unlisten = this.props.history.listen((location, action) => {
            // The _mfq object is the entry point for all communication with the Mouseflow tracking script.
            // We push a key-value pair into this array each time the routing changes.
            window._mfq = window._mfq || [];
            window._mfq.push(['newPageView', location.pathname]);
        });
    }

    componentWillUnmount() {
        // Unlisten when the component lifecycle ends.
        this.unlisten();
    }

    render() {

        return (
            <ConnectedRouter history={this.props.history}>
                <DefaultLayout>
                    {this.state.showBrowserWarning &&
                        <div class="alert alert-danger alert-server" role="alert" style={{ borderRadius: '0' }}>
                            <strong>Outdated browser</strong> You are using Internet Explorer which is not supported. Please upgrade your browser for the best experience
                        </div>
                    }
                    <Switch>
                        {renderRoutes(routes)}
                    </Switch>
                </DefaultLayout>
            </ConnectedRouter>
        )
    }
}

App.propTypes = {
    history: PropTypes.object,
};

export default withCookies(App);