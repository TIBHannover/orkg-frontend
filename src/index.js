import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import 'fast-text-encoding/text';
import 'jspdf/dist/polyfills.es.js';
import { createRoot } from 'react-dom/client';
import theme from 'assets/scss/ThemeVariables';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from 'styled-components';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import { DndProvider } from 'react-dnd';
import env from '@beam-australia/react-env';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import rootReducer from './slices/rootReducer';
import configureStore from './store';
import { unregister } from './registerServiceWorker';
import App from './App';

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

const { store, history } = configureStore();
const container = document.getElementById('root');
const root = createRoot(container);

const render = () => {
    root.render(
        <DndProvider backend={HTML5Backend}>
            <CookiesProvider>
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        <MatomoProvider value={matomoInstance}>
                            <Router basename={env('PUBLIC_URL')} history={history}>
                                <App />
                            </Router>
                        </MatomoProvider>
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
