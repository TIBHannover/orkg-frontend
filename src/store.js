import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers/rootReducer';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import env from '@beam-australia/react-env';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // enable redux debug tools

export const history = createBrowserHistory({ basename: env('PUBLIC_URL') });

export default function configureStore() {
    return createStore(rootReducer(history), composeEnhancers(applyMiddleware(thunk, routerMiddleware(history))));
}
