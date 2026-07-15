'use client';

import { createContext, Dispatch, FC, ReactNode, useCallback, useContext, useMemo, useReducer, useRef } from 'react';

type ComparisonReducerState = {
    id: string;
    isEmbedded: boolean;
    /**
     * Instance key for the URL dialog-history scope (`s` field, see useHistory).
     * Defaults to the comparison id; embedders pass a unique key (e.g. the
     * review section id) so the same comparison can be embedded twice with
     * independent dialog state.
     */
    scopeKey: string;
};

type ComparisonState = ComparisonReducerState & {
    /**
     * Opens (or navigates) this scope's DataBrowser dialog rooted at the given
     * prefix. Stable identity so cells and column headers can trigger dialogs
     * without holding a URL subscription — the actual (nuqs-backed) opener is
     * registered by the ComparisonDialogs controller.
     */
    openDialogEntry: (prefix: string[]) => void;
    /** Wires openDialogEntry to the ComparisonDialogs controller (internal). */
    registerDialogOpener: (opener: (prefix: string[]) => void) => void;
};

type ComparisonAction = { type: 'UNKNOWN' };

const initialState: ComparisonState = {
    id: '',
    isEmbedded: false,
    scopeKey: '',
    openDialogEntry: () => {},
    registerDialogOpener: () => {},
};

export const ComparisonContext = createContext<ComparisonState>(initialState);
export const ComparisonDispatchContext = createContext<Dispatch<ComparisonAction>>(() => {});

export const comparisonReducer = (state: ComparisonReducerState, action: ComparisonAction): ComparisonReducerState => {
    switch (action.type) {
        default: {
            throw Error('Unknown action');
        }
    }
};

export function useComparisonState() {
    return useContext(ComparisonContext);
}

export function useComparisonDispatch() {
    return useContext(ComparisonDispatchContext);
}

type ComparisonProviderProps = {
    children: ReactNode;
    id: string;
    isEmbedded: boolean;
    scopeKey?: string;
};

const ComparisonContextProvider: FC<ComparisonProviderProps> = ({ children, id, isEmbedded, scopeKey }) => {
    const [state, dispatch] = useReducer(comparisonReducer, {
        id,
        isEmbedded,
        scopeKey: scopeKey ?? id,
    });

    const openerRef = useRef<(prefix: string[]) => void>(() => {});
    const openDialogEntry = useCallback((prefix: string[]) => openerRef.current(prefix), []);
    const registerDialogOpener = useCallback((opener: (prefix: string[]) => void) => {
        openerRef.current = opener;
    }, []);

    const value = useMemo(() => ({ ...state, openDialogEntry, registerDialogOpener }), [state, openDialogEntry, registerDialogOpener]);

    return (
        <ComparisonContext.Provider value={value}>
            <ComparisonDispatchContext.Provider value={dispatch}>{children}</ComparisonDispatchContext.Provider>
        </ComparisonContext.Provider>
    );
};

export default ComparisonContextProvider;
