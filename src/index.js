import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import 'fast-text-encoding/text';
import 'jspdf/dist/polyfills.es.js';
import ReactDOM from 'react-dom';
import App from './App';
import { unregister } from './registerServiceWorker';
import theme from 'assets/scss/ThemeVariables';
import { Provider } from 'react-redux';
import configureStore, { history } from './store';
import rootReducer from './slices/rootReducer';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from 'styled-components';
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react';
import { DndProvider } from 'react-dnd';
import env from '@beam-australia/react-env';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HistoryRouter as Router } from 'redux-first-history/rr6';

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
                  disableCookies: true
              }
          })
        : undefined;

const store = configureStore();
const render = () => {
    ReactDOM.render(
        <DndProvider backend={HTML5Backend}>
            <CookiesProvider>
                <Provider store={store}>
                    <ThemeProvider theme={theme}>
                        <MatomoProvider value={matomoInstance}>
                            <Router history={history}>
                                <App />
                            </Router>
                        </MatomoProvider>
                    </ThemeProvider>
                </Provider>
            </CookiesProvider>
        </DndProvider>,
        document.getElementById('root')
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
