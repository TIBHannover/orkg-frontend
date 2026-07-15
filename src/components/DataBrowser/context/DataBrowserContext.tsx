'use client';

import { useCookies } from 'next-client-cookies';
import { createContext, Dispatch, FC, ReactNode, useContext, useEffect, useReducer } from 'react';

import { DataBrowserConfig, DataBrowserPreferences, DataBrowserResourceContext, History } from '@/components/DataBrowser/types/DataBrowserTypes';
import { parseBooleanPreferenceCookie } from '@/lib/cookieHelpers';
import { Predicate } from '@/services/backend/types';

type DataBrowserState = {
    rootId: string;
    newProperties: Record<string, Predicate[]>;
    config: DataBrowserConfig;
    preferences: DataBrowserPreferences;
    context: DataBrowserResourceContext;
    loadedResources: Record<string, string[]>; // key is the resource id, value is the path to the resource
    localHistory: History; // navigation history when config.historyStorage === 'local' (see useHistory)
};

type DataBrowserAction =
    | { type: 'ADD_PROPERTY'; payload: { predicate: Predicate; id: string } }
    | { type: 'DELETE_PROPERTY'; payload: { id: string; predicateId: string } }
    | { type: 'SET_IS_EDIT_MODE'; payload: boolean }
    | { type: 'UPDATE_PREFERENCES'; payload: Partial<DataBrowserPreferences> }
    | { type: 'ADD_LOADED_RESOURCES'; payload: Record<string, string[]> }
    | { type: 'SET_LOADED_RESOURCES'; payload: Record<string, string[]> }
    // Functional payload so useHistory's computeUpdatedHistory always sees the
    // true previous value — same contract as the nuqs functional setter
    | { type: 'SET_LOCAL_HISTORY'; payload: (prev: History) => History };

const initialState = {
    rootId: '',
    newProperties: {},
    config: {},
    context: {},
    preferences: {
        showInlineDataTypes: false,
        expandValuesByDefault: true,
    },
    loadedResources: {},
    localHistory: [],
};

export const DataBrowserContext = createContext<DataBrowserState>(initialState);
export const DataBrowserDispatchContext = createContext<Dispatch<DataBrowserAction>>(() => {});

export const dataBrowserReducer = (state: DataBrowserState, action: DataBrowserAction) => {
    switch (action.type) {
        case 'ADD_PROPERTY': {
            return {
                ...state,
                newProperties: {
                    ...state.newProperties,
                    [action.payload.id]: [...(state.newProperties[action.payload.id] || []), action.payload.predicate],
                },
            };
        }
        case 'DELETE_PROPERTY': {
            return {
                ...state,
                newProperties: {
                    ...state.newProperties,
                    [action.payload.id]: state.newProperties[action.payload.id].filter((p) => p.id !== action.payload.predicateId),
                },
            };
        }
        case 'SET_IS_EDIT_MODE': {
            return { ...state, config: { ...state.config, isEditMode: action.payload } };
        }
        case 'UPDATE_PREFERENCES': {
            return {
                ...state,
                preferences: { ...state.preferences, ...action.payload },
            };
        }
        case 'ADD_LOADED_RESOURCES': {
            return { ...state, loadedResources: { ...state.loadedResources, ...action.payload } };
        }
        case 'SET_LOADED_RESOURCES': {
            return { ...state, loadedResources: action.payload };
        }
        case 'SET_LOCAL_HISTORY': {
            return { ...state, localHistory: action.payload(state.localHistory) };
        }
        default: {
            throw Error('Unknown action');
        }
    }
};

export function useDataBrowserState() {
    return useContext(DataBrowserContext);
}

export function useDataBrowserDispatch() {
    return useContext(DataBrowserDispatchContext);
}

type DataBrowserProviderProps = {
    children: ReactNode;
    rootId: string;
    config: DataBrowserConfig;
    context: DataBrowserResourceContext;
};

const DataBrowserProvider: FC<DataBrowserProviderProps> = ({ children, rootId, config, context }) => {
    const cookies = useCookies();
    const [dataBrowserState, dispatch] = useReducer(
        dataBrowserReducer,
        { rootId, config, context, cookies },
        ({ rootId: rid, config: cfg, context: ctx, cookies: c }) => ({
            rootId: rid,
            newProperties: {},
            config: cfg,
            preferences: {
                showInlineDataTypes: parseBooleanPreferenceCookie(c.get('preferences.showInlineDataTypes')) ?? true,
                expandValuesByDefault: parseBooleanPreferenceCookie(c.get('preferences.expandValuesByDefault')) ?? true,
            },
            context: ctx,
            loadedResources: {},
            localHistory: [],
        }),
    );

    useEffect(() => {
        dispatch({ type: 'SET_IS_EDIT_MODE', payload: !!config.isEditMode });
    }, [config.isEditMode]);

    return (
        <DataBrowserContext.Provider value={dataBrowserState}>
            <DataBrowserDispatchContext.Provider value={dispatch}>{children}</DataBrowserDispatchContext.Provider>
        </DataBrowserContext.Provider>
    );
};

export default DataBrowserProvider;
