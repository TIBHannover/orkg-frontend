import { configureStore } from '@reduxjs/toolkit';
import { createReduxHistoryContext } from 'redux-first-history';
import combinedReducers from './slices/rootReducer';
import { createBrowserHistory } from 'history';
import env from '@beam-australia/react-env';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
    history: createBrowserHistory({ basename: env('PUBLIC_URL') })
});

export default function store(initialState = {}) {
    return configureStore({
        preloadedState: initialState,
        reducer: combinedReducers(routerReducer),
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware)
    });
}

export const history = createReduxHistory(store());
