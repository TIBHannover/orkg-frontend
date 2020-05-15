import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { unregister } from './registerServiceWorker';
import { Provider } from 'react-redux';
import configureStore, { history } from './store';
import { AppContainer } from 'react-hot-loader';
import rootReducer from './reducers/rootReducer';
import { CookiesProvider } from 'react-cookie';
import { ThemeProvider } from 'styled-components';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

// Extract Sass variables into a JS object
// eslint-disable-next-line import/no-webpack-loader-syntax
const theme = require('sass-extract-loader?{plugins: ["sass-extract-js"]}!./assets/scss/ThemeVariables.scss');

const store = configureStore();
const render = () => {
    ReactDOM.render(
        <AppContainer>
            <DndProvider backend={HTML5Backend}>
                <CookiesProvider>
                    <Provider store={store}>
                        <ThemeProvider theme={theme}>
                            <App history={history} />
                        </ThemeProvider>
                    </Provider>
                </CookiesProvider>
            </DndProvider>
        </AppContainer>,
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

    module.hot.accept('./reducers/rootReducer', () => {
        store.replaceReducer(rootReducer(history));
    });
}
