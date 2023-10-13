import { Suspense, useState } from 'react';
import routes from 'routes.config';
import DefaultLayout from 'components/Layout/DefaultLayout';
import 'assets/scss/CustomBootstrap.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/animations/shift-away.css';
import 'intro.js/introjs.css';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-csl';
import { plugins } from '@citation-js/core';
import { useRoutes } from 'react-router-dom';
import { detect } from 'detect-browser';
import ScrollToTop from 'components/ScrollToTop';
import { Alert } from 'reactstrap';
import env from 'components/NextJsMigration/env';
import { Helmet } from 'react-helmet';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

// Configuration for citation-js bibtex plubin
const config = plugins.config.get('@bibtex');
config.format.useIdAsLabel = true;

const alertStyle = { borderRadius: '0', marginTop: '-30px', marginBottom: '30px' };

const App = () => {
    const browser = detect();
    const [showBrowserWarning] = useState(browser && browser.name === 'ie');
    const element = useRoutes(routes.map(c => ({ ...c, element: <c.element /> })));

    return (
        <ScrollToTop>
            <ErrorBoundary>
                <DefaultLayout>
                    {showBrowserWarning && (
                        <Alert color="danger" style={alertStyle} className="text-center">
                            <strong>Outdated browser</strong> You are using Internet Explorer which is not supported. Please upgrade your browser for
                            the best experience
                        </Alert>
                    )}
                    {env('IS_TESTING_SERVER') === 'true' && (
                        <>
                            <Helmet>
                                <meta name="robots" content="noindex" /> {/* make sure search engines are not indexing our test server */}
                            </Helmet>
                            <Alert color="warning" style={alertStyle} className="text-center">
                                <strong>Warning:</strong> You are using a testing environment. Data you enter in the system can be deleted without any
                                notice.
                            </Alert>
                        </>
                    )}
                    {/* Suspense is used for when the component is lazy loaded */}
                    <Suspense fallback={<div className="mt-5 mb-2 text-center">Loading...</div>}>{element}</Suspense>
                </DefaultLayout>
            </ErrorBoundary>
        </ScrollToTop>
    );
};

export default App;
