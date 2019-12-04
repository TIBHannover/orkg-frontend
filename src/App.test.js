import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import configureStore, { history } from './store';
import { AppContainer } from 'react-hot-loader';
import { shallow } from 'enzyme';

it('renders without crashing', () => {
    const div = document.createElement('div');
    const store = configureStore();

    ReactDOM.render(
        <AppContainer>
            <Provider store={store}>
                <App history={history} />
            </Provider>
        </AppContainer>,
        div
    );
});

it('renders without crashing', () => {
    shallow(<App />);
});
