'use client';

import { useCookies } from 'next-client-cookies';
import { createContext, Dispatch, FC, ReactNode, use, useReducer } from 'react';

import { DataBrowserConfig, DataBrowserPreferences, DataBrowserResourceContext, History } from '@/components/DataBrowser/types/DataBrowserTypes';
import { parseBooleanPreferenceCookie } from '@/lib/cookieHelpers';
import { Predicate } from '@/services/backend/types';

type ReducedState = {
    rootId: string;
    newProperties: Record<string, Predicate[]>;
    preferences: DataBrowserPreferences;
    context: DataBrowserResourceContext;
    loadedResources: Record<string, string[]>; // key is the resource id, value is the path to the resource
    localHistory: History; // navigation history when config.historyStorage === 'local' (see useHistory)
};

type DataBrowserState = ReducedState & {
    config: DataBrowserConfig;
};

type DataBrowserAction =
    | { type: 'ADD_PROPERTY'; payload: { predicate: Predicate; id: string } }
    | { type: 'DELETE_PROPERTY'; payload: { id: string; predicateId: string } }
    | { type: 'UPDATE_PREFERENCES'; payload: Partial<DataBrowserPreferences> }
    | { type: 'ADD_LOADED_RESOURCES'; payload: Record<string, string[]> }
    | { type: 'SET_LOADED_RESOURCES'; payload: Record<string, string[]> }
    // Functional payload so useHistory's computeUpdatedHistory always sees the
    // true previous value — same contract as the nuqs functional setter
    | { type: 'SET_LOCAL_HISTORY'; payload: (prev: History) => History };

const initialState: DataBrowserState = {
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

export const dataBrowserReducer = (state: ReducedState, action: DataBrowserAction): ReducedState => {
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
    return use(DataBrowserContext);
}

export function useDataBrowserDispatch() {
    return use(DataBrowserDispatchContext);
}

type DataBrowserProviderProps = {
    children: ReactNode;
    rootId: string;
    config: DataBrowserConfig;
    context: DataBrowserResourceContext;
};

const DataBrowserProvider: FC<DataBrowserProviderProps> = ({ children, rootId, config, context }) => {
    const cookies = useCookies();
    // config is passed through the context value (not the reducer): it is the caller's
    // prop and must reflect prop updates without a dispatch round-trip.
    const [reducedState, dispatch] = useReducer(
        dataBrowserReducer,
        undefined,
        (): ReducedState => ({
            rootId,
            newProperties: {},
            preferences: {
                showInlineDataTypes: parseBooleanPreferenceCookie(cookies.get('preferences.showInlineDataTypes')) ?? true,
                expandValuesByDefault: parseBooleanPreferenceCookie(cookies.get('preferences.expandValuesByDefault')) ?? true,
            },
            context,
            loadedResources: {},
            localHistory: [],
        }),
    );
    const value: DataBrowserState = { ...reducedState, config };

    return (
        <DataBrowserContext value={value}>
            <DataBrowserDispatchContext value={dispatch}>{children}</DataBrowserDispatchContext>
        </DataBrowserContext>
    );
};

export default DataBrowserProvider;
