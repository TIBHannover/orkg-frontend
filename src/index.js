import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux'
import configureStore, { history } from './store'
import { AppContainer } from 'react-hot-loader';
import rootReducer from './reducers/rootReducer';

const store = configureStore();
const render = () => {
    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <App history={history} />
            </Provider>
        </AppContainer>,
        document.getElementById('root')
    );
}

render();
registerServiceWorker();

// Hot reloading components and reducers
if (module.hot) {
    module.hot.accept('./App', () => {
        render()
    });

    module.hot.accept('./reducers/rootReducer', () => {
        store.replaceReducer(rootReducer(history))
    });
}