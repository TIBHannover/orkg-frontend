import { createContext, Dispatch, FC, ReactNode, useContext, useReducer } from 'react';

import { RSPropertyShape } from '@/services/backend/types';
import { guid } from '@/utils';

export type RosettaTemplateEditorType = {
    id?: string;
    numberLockedProperties: number;
    examples: string;
    lockedExamples: string;
    label: string;
    description: string;
    properties: RSPropertyShape[];
    isSaving: boolean;
};

type RosettaTemplateEditorAction =
    | { type: 'initState'; payload: null }
    | { type: 'setLabel'; payload: string }
    | { type: 'setDescription'; payload: string }
    | { type: 'setExamples'; payload: string }
    | { type: 'setIsSaving'; payload: boolean }
    | { type: 'setProperty'; payload: { index: number; data: RSPropertyShape } }
    | { type: 'reorderProperties'; payload: RSPropertyShape[] }
    | { type: 'addObjectPosition'; payload: string }
    | { type: 'deleteObjectPosition'; payload: number };

const getInitialData = () => {
    const initialState = {
        id: undefined,
        numberLockedProperties: 0,
        examples: '',
        lockedExamples: '',
        label: '',
        description: '',
        properties: [
            { id: guid(), placeholder: '', description: '' },
            { id: guid(), placeholder: '', description: '' },
        ],
        isSaving: false,
    };

    return initialState;
};

export const RosettaTemplateEditorContext = createContext<RosettaTemplateEditorType>(getInitialData());
export const RosettaTemplateEditorDispatchContext = createContext<Dispatch<RosettaTemplateEditorAction>>(() => {});

export const rosettaTemplateEditorReducer = (autocompleteState: RosettaTemplateEditorType, action: RosettaTemplateEditorAction) => {
    switch (action.type) {
        case 'initState': {
            return { ...getInitialData() };
        }
        case 'setLabel': {
            return { ...autocompleteState, label: action.payload };
        }
        case 'setDescription': {
            return { ...autocompleteState, description: action.payload };
        }
        case 'setExamples': {
            return { ...autocompleteState, examples: action.payload };
        }
        case 'setIsSaving': {
            return { ...autocompleteState, isSaving: action.payload };
        }
        case 'setProperty': {
            // must stay immutable: the React Compiler caches derivations keyed on the
            // array identity, so mutating `properties` in place freezes the form fields
            return {
                ...autocompleteState,
                properties: autocompleteState.properties.map((property, i) => (i === action.payload.index ? action.payload.data : property)),
            };
        }
        case 'reorderProperties': {
            return { ...autocompleteState, properties: action.payload };
        }
        case 'addObjectPosition': {
            return { ...autocompleteState, properties: [...autocompleteState.properties, { id: action.payload, placeholder: '', description: '' }] };
        }
        case 'deleteObjectPosition': {
            return {
                ...autocompleteState,
                properties: autocompleteState.properties.filter((_property, i) => i !== action.payload),
            };
        }
        default: {
            throw Error('Unknown action');
        }
    }
};

export function useRosettaTemplateEditorState() {
    return useContext(RosettaTemplateEditorContext);
}

export function useRosettaTemplateEditorDispatch() {
    return useContext(RosettaTemplateEditorDispatchContext);
}

const RosettaTemplateEditorProvider: FC<{ children: ReactNode; initialState?: RosettaTemplateEditorType }> = ({ children, initialState }) => {
    const [rosettaTemplateEditor, dispatch] = useReducer(rosettaTemplateEditorReducer, initialState || getInitialData());

    return (
        <RosettaTemplateEditorContext.Provider value={rosettaTemplateEditor}>
            <RosettaTemplateEditorDispatchContext.Provider value={dispatch}>{children}</RosettaTemplateEditorDispatchContext.Provider>
        </RosettaTemplateEditorContext.Provider>
    );
};

export default RosettaTemplateEditorProvider;
