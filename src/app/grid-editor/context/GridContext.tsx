import { createContext, Dispatch, FC, ReactNode, useContext, useReducer } from 'react';

import { getPreferenceFromCookies } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { Predicate, Statement } from '@/services/backend/types';

// Type definition for grid row data
export type TData = {
    id: string;
    predicate: Predicate;
    statements: Record<string, Statement | null>;
};

type GridState = {
    newProperties: Predicate[];
    newRows: TData[];
    isHelpModalOpen: boolean;
    helpCenterArticleId?: string;
};

type GridAction =
    | { type: 'ADD_PROPERTY'; payload: { predicate: Predicate } }
    | { type: 'DELETE_PROPERTY'; payload: { predicateId: string } }
    | { type: 'ADD_ROW'; payload: { row: TData } }
    | { type: 'DELETE_ROW'; payload: { rowId: string } }
    | { type: 'SET_IS_HELP_MODAL_OPEN'; payload: { isOpen: boolean; articleId?: string } };

const initialState = {
    newProperties: [],
    newRows: [],
    isHelpModalOpen: getPreferenceFromCookies('showInlineDataTypes') ?? false,
};

export const GridContext = createContext<GridState>(initialState);
export const GridDispatchContext = createContext<Dispatch<GridAction>>(() => {});

export const gridReducer = (state: GridState, action: GridAction) => {
    switch (action.type) {
        case 'ADD_PROPERTY': {
            return {
                ...state,
                newProperties: [...state.newProperties, action.payload.predicate],
            };
        }
        case 'DELETE_PROPERTY': {
            return {
                ...state,
                newProperties: state.newProperties.filter((p) => p.id !== action.payload.predicateId),
            };
        }
        case 'ADD_ROW': {
            return { ...state, newRows: [...state.newRows, action.payload.row] };
        }
        case 'DELETE_ROW': {
            return { ...state, newRows: state.newRows.filter((r) => r.id !== action.payload.rowId) };
        }
        case 'SET_IS_HELP_MODAL_OPEN': {
            return { ...state, isHelpModalOpen: action.payload.isOpen, helpCenterArticleId: action.payload.articleId };
        }

        default: {
            throw Error('Unknown action');
        }
    }
};

export function useGridState() {
    return useContext(GridContext);
}

export function useGridDispatch() {
    return useContext(GridDispatchContext);
}

type GridProviderProps = {
    children: ReactNode;
};

const GridProvider: FC<GridProviderProps> = ({ children }) => {
    const [gridState, dispatch] = useReducer(gridReducer, {
        newProperties: [],
        newRows: [],
        helpCenterArticleId: '',
        isHelpModalOpen: false,
    });

    return (
        <GridContext.Provider value={gridState}>
            <GridDispatchContext.Provider value={dispatch}>{children}</GridDispatchContext.Provider>
        </GridContext.Provider>
    );
};

export default GridProvider;
