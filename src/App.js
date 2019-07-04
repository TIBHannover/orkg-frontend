import React, { Component } from 'react';
import { Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config'
import routes from './routes.config'
import DefaultLayout from './components/Layout/DefaultLayout';
import './assets/scss/CustomBootstrap.scss';
import 'react-notifications/lib/notifications.css';
import { ConnectedRouter } from 'connected-react-router'
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';

class App extends Component {
    render() {
        return (
            <ConnectedRouter history={this.props.history}>
                <DefaultLayout>
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