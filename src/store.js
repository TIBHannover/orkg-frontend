import { configureStore } from '@reduxjs/toolkit';
import { createReduxHistoryContext } from 'redux-first-history';
import { createBrowserHistory } from 'history';
import env from 'components/NextJsMigration/env';
import combinedReducers from 'slices/rootReducer';

// CRA-CODE
const { createReduxHistory, routerMiddleware, routerReducer } = createReduxHistoryContext({
    history: createBrowserHistory({ basename: env('PUBLIC_URL') }),
});

export default function store(initialState = {}) {
    const store = configureStore({
        preloadedState: initialState,
        reducer: combinedReducers(routerReducer),
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware),
    });
    const history = createReduxHistory(store);

    return { store, history };
}

// // NEXT-CODE
// export default function store(initialState = {}) {
//     const store = configureStore({
//         preloadedState: initialState,
//         reducer: combinedReducers({}),
//     });
//     return { store };
// }
