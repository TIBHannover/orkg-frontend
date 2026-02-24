'use client';

import { createContext, Dispatch, FC, ReactNode, useContext, useReducer } from 'react';

type ComparisonState = {
    id: string;
    isEmbedded: boolean;
};

type ComparisonAction = { type: 'UNKNOWN' };

const initialState: ComparisonState = {
    id: '',
    isEmbedded: false,
};

export const ComparisonContext = createContext<ComparisonState>(initialState);
export const ComparisonDispatchContext = createContext<Dispatch<ComparisonAction>>(() => {});

export const comparisonReducer = (state: ComparisonState, action: ComparisonAction): ComparisonState => {
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
};

const ComparisonContextProvider: FC<ComparisonProviderProps> = ({ children, id, isEmbedded }) => {
    const [state, dispatch] = useReducer(comparisonReducer, {
        id,
        isEmbedded,
    });

    return (
        <ComparisonContext.Provider value={state}>
            <ComparisonDispatchContext.Provider value={dispatch}>{children}</ComparisonDispatchContext.Provider>
        </ComparisonContext.Provider>
    );
};

export default ComparisonContextProvider;
