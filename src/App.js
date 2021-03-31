import { Component, Suspense } from 'react';
import { Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from 'routes.config';
import DefaultLayout from 'components/Layout/DefaultLayout';
import 'assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
import { MatomoContext } from '@datapunt/matomo-tracker-react';
import { ConnectedRouter } from 'connected-react-router';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { detect } from 'detect-browser';
import ScrollToTop from 'components/ScrollToTop';
import MetaTags from 'react-meta-tags';
import { Alert } from 'reactstrap';
import env from '@beam-australia/react-env';

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

    componentDidMount() {
        const matomoTracker = this.context;
        // Listen for changes to the current location.
        this.unlisten = this.props.history.listen((location, action) => {
            setTimeout(function() {
                matomoTracker && matomoTracker.trackPageView();
            }, 1000);
        });
    }

    componentWillUnmount() {
        // Unlisten when the component lifecycle ends.
        this.unlisten();
    }

    static contextType = MatomoContext;

    render() {
        const alertStyle = { borderRadius: '0', marginTop: '-30px', marginBottom: '30px' };

        return (
            <ConnectedRouter history={this.props.history}>
                <ScrollToTop>
                    <DefaultLayout>
                        {this.state.showBrowserWarning && (
                            <Alert color="danger" style={alertStyle} className="text-center">
                                <strong>Outdated browser</strong> You are using Internet Explorer which is not supported. Please upgrade your browser
                                for the best experience
                            </Alert>
                        )}
                        {env('IS_TESTING_SERVER') === 'true' && (
                            <>
                                <MetaTags>
                                    <meta name="robots" content="noindex" /> {/* make sure search engines are not indexing our test server */}
                                </MetaTags>
                                <Alert color="warning" style={alertStyle} className="text-center">
                                    <strong>Warning:</strong> You are using a testing environment. Data you enter in the system can be deleted without
                                    any notice.
                                </Alert>
                            </>
                        )}
                        {/* Suspense is used for when the component is lazy loaded */}
                        <Suspense fallback={<div className="mt-5 mb-2 text-center">Loading...</div>}>
                            <Switch>{renderRoutes(routes)}</Switch>
                        </Suspense>
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
