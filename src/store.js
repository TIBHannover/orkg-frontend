import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './slices/rootReducer';
import { routerMiddleware } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import env from '@beam-australia/react-env';

export const history = createBrowserHistory({ basename: env('PUBLIC_URL') });

export default function store(initialState = {}) {
    return configureStore({
        preloadedState: initialState,
        reducer: rootReducer(history),
        middleware: getDefaultMiddleware => getDefaultMiddleware().concat(routerMiddleware(history))
    });
}
