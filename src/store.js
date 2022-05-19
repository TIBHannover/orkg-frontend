import { configureStore } from '@reduxjs/toolkit';
import { createReduxHistoryContext } from 'redux-first-history';
import combinedReducers from './slices/rootReducer';
import { createBrowserHistory } from 'history';
import { LOCATION_CHANGE as LOCATION_CHANGE_RFH } from 'redux-first-history';
import env from '@beam-australia/react-env';

const isInTest = typeof global.it === 'function';

export const LOCATION_CHANGE = !isInTest ? LOCATION_CHANGE_RFH : 'NoReset';

const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
    history: createBrowserHistory({ basename: env('PUBLIC_URL') })
});

export default function store(initialState = {}) {
    const store = configureStore({
        preloadedState: initialState,
        reducer: combinedReducers(routerReducer),
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware)
    });
    const history = createReduxHistory(store);

    return { store, history };
}
