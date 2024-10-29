import { getPreferenceFromCookies } from 'components/DataBrowser/utils/dataBrowserUtils';
import { Dispatch, FC, ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { Predicate } from 'services/backend/types';
import { DataBrowserConfig, DataBrowserPreferences, DataBrowserResourceContext } from 'components/DataBrowser/types/DataBrowserTypes';

type DataBrowserState = {
    rootId: string;
    newProperties: Record<string, Predicate[]>;
    config: DataBrowserConfig;
    preferences: DataBrowserPreferences;
    context: DataBrowserResourceContext;
    highlightedCycle?: string;
    isHelpModalOpen: boolean;
    helpCenterArticleId?: string;
    history?: string[];
};

type DataBrowserAction =
    | { type: 'ADD_PROPERTY'; payload: { predicate: Predicate; id: string } }
    | { type: 'DELETE_PROPERTY'; payload: { id: string; predicateId: string } }
    | { type: 'HIGHLIGHT_CYCLE'; payload: string }
    | { type: 'SET_IS_EDIT_MODE'; payload: boolean }
    | { type: 'SET_HISTORY'; payload: string[] }
    | { type: 'UPDATE_PREFERENCES'; payload: Partial<DataBrowserPreferences> }
    | { type: 'SET_IS_HELP_MODAL_OPEN'; payload: { isOpen: boolean; articleId?: string } };

const initialState = {
    rootId: '',
    newProperties: {},
    config: {},
    context: {},
    preferences: {
        showInlineDataTypes: false,
        expandValuesByDefault: true,
    },
    isHelpModalOpen: getPreferenceFromCookies('showInlineDataTypes') ?? false,
};

export const DataBrowserContext = createContext<DataBrowserState>(initialState);
export const DataBrowserDispatchContext = createContext<Dispatch<DataBrowserAction>>(() => {});

export const dataBrowserReducer = (state: DataBrowserState, action: DataBrowserAction) => {
    switch (action.type) {
        case 'HIGHLIGHT_CYCLE': {
            return { ...state, highlightedCycle: action.payload };
        }
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
        case 'SET_HISTORY': {
            return { ...state, history: action.payload };
        }
        case 'SET_IS_HELP_MODAL_OPEN': {
            return { ...state, isHelpModalOpen: action.payload.isOpen, helpCenterArticleId: action.payload.articleId };
        }
        case 'UPDATE_PREFERENCES': {
            return {
                ...state,
                preferences: { ...state.preferences, ...action.payload },
            };
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
    const [dataBrowserState, dispatch] = useReducer(dataBrowserReducer, {
        rootId,
        newProperties: {},
        config,
        preferences: {
            showInlineDataTypes: getPreferenceFromCookies('showInlineDataTypes') ?? true,
            expandValuesByDefault: getPreferenceFromCookies('expandValuesByDefault') ?? true,
        },
        context,
        isHelpModalOpen: false,
        ...(config.defaultHistory && config.defaultHistory.length > 0 && { history: config.defaultHistory }),
    });

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
