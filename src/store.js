import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers/rootReducer';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import env from '@beam-australia/react-env';

export const history = createBrowserHistory({ basename: env('PUBLIC_URL') });

/*export default function configureStore(initialState = {}) {
    return configureStoreToolkit(rootReducer(history), initialState, composeEnhancers(applyMiddleware(thunk, routerMiddleware(history))));
}*/

export default function store(initialState = {}) {
    return configureStore({
        preloadedState: initialState,
        reducer: rootReducer(history),
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware(history))
    });
}
