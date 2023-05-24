import env from '@beam-australia/react-env';
import { plugins } from '@citation-js/core';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';
import App from 'App';
import theme from 'assets/scss/ThemeVariables';
import { MathJaxContext } from 'better-react-mathjax';
import MATH_JAX_CONFIG from 'constants/mathJax';
import REGEX from 'constants/regex';
import 'fast-text-encoding/text.min';
import 'jspdf/dist/polyfills.es.js';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import { CookiesProvider } from 'react-cookie';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { unregister } from 'registerServiceWorker';
import rootReducer from 'slices/rootReducer';
import configureStore from 'store';
import { ThemeProvider } from 'styled-components';

const matomoInstance =
    env('MATOMO_TRACKER') === 'true'
        ? createInstance({
              urlBase: 'https://www.orkg.org/',
              siteId: env('MATOMO_TRACKER_SITE_ID'),
              trackerUrl: `${env('MATOMO_TRACKER_URL')}matomo.php`,
              srcUrl: `${env('MATOMO_TRACKER_URL')}matomo.js`,
              disabled: false,
              linkTracking: true,
              trackPageView: true,
              configurations: {
                  disableCookies: true,
              },
          })
        : undefined;

// https://github.com/citation-js/citation-js/issues/182
plugins.input.add('@doi/api', {
    parseType: {
        dataType: 'String',
        predicate: REGEX.DOI_URL,
        extends: '@else/url',
    },
});
plugins.input.add('@doi/id', {
    parseType: {
        dataType: 'String',
        predicate: REGEX.DOI_ID,
    },
});

const { store, history } = configureStore();
const container = document.getElementById('root');
const root = createRoot(container);

const render = () => {
    root.render(
        <DndProvider backend={HTML5Backend}>
            <CookiesProvider>
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        <MathJaxContext config={MATH_JAX_CONFIG}>
                            <MatomoProvider value={matomoInstance}>
                                <Router basename={env('PUBLIC_URL')} history={history}>
                                    <App />
                                </Router>
                            </MatomoProvider>
                        </MathJaxContext>
                    </ThemeProvider>
                </Provider>
            </CookiesProvider>
        </DndProvider>,
    );
};

render();
unregister();

// Hot reloading components and reducers
if (module.hot) {
    module.hot.accept('./App', () => {
        render();
    });

    module.hot.accept('./slices/rootReducer', () => {
        store.replaceReducer(rootReducer(history));
    });
}
