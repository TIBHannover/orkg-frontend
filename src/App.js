import { Suspense, useState } from 'react';
import { Switch } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import routes from 'routes.config';
import DefaultLayout from 'components/Layout/DefaultLayout';
import 'assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
import { ConnectedRouter } from 'connected-react-router';
import { CompatRouter } from 'react-router-dom-v5-compat';
import PropTypes from 'prop-types';
import { detect } from 'detect-browser';
import ScrollToTop from 'components/ScrollToTop';
import MetaTags from 'react-meta-tags';
import { Alert } from 'reactstrap';
import env from '@beam-australia/react-env';

const alertStyle = { borderRadius: '0', marginTop: '-30px', marginBottom: '30px' };

const App = ({ history }) => {
    const browser = detect();
    const [showBrowserWarning] = useState(browser && browser.name === 'ie');

    return (
        <ConnectedRouter history={history}>
            <CompatRouter>
                <ScrollToTop>
                    <DefaultLayout>
                        {showBrowserWarning && (
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
            </CompatRouter>
        </ConnectedRouter>
    );
};

App.propTypes = {
    history: PropTypes.object
};

export default App;
