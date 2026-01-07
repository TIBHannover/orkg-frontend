import { configureStore } from '@reduxjs/toolkit';

import combinedReducers from '@/slices/rootReducer';

export function setupStore(initialState = {}) {
    const store = configureStore({
        preloadedState: initialState,
        reducer: combinedReducers({}),
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: ['pdfAnnotation/setParsedPdfData'],
                },
            }),
    });
    return { store };
}

export type AppStore = ReturnType<typeof setupStore>;
