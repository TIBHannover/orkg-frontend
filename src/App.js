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