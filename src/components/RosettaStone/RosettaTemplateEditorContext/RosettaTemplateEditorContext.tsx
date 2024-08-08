import arrayMove from 'array-move';
import { Dispatch, FC, ReactNode, createContext, useContext, useReducer } from 'react';
import { PropertyShape } from 'services/backend/types';
import { guid } from 'utils';

export type RosettaTemplateEditorType = {
    step: number;
    examples: string;
    label: string;
    description: string;
    properties: PropertyShape[];
    isSaving: boolean;
};

type RosettaTemplateEditorAction =
    | { type: 'initState'; payload: null }
    | { type: 'setStep'; payload: number }
    | { type: 'setLabel'; payload: string }
    | { type: 'setDescription'; payload: string }
    | { type: 'setExamples'; payload: string }
    | { type: 'setIsSaving'; payload: boolean }
    | { type: 'setProperty'; payload: { index: number; data: PropertyShape } }
    | { type: 'moveProperties'; payload: { dragIndex: number; hoverIndex: number } }
    | { type: 'addObjectPosition'; payload: string }
    | { type: 'deleteObjectPosition'; payload: number };

const getInitialData = () => {
    const initialState = {
        step: 1,
        examples: '',
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
        case 'setStep': {
            return { ...autocompleteState, step: action.payload };
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
            autocompleteState.properties[action.payload.index] = action.payload.data;
            return { ...autocompleteState };
        }
        case 'moveProperties': {
            return { ...autocompleteState, properties: arrayMove(autocompleteState.properties, action.payload.dragIndex, action.payload.hoverIndex) };
        }
        case 'addObjectPosition': {
            return { ...autocompleteState, properties: [...autocompleteState.properties, { id: action.payload, placeholder: '', description: '' }] };
        }
        case 'deleteObjectPosition': {
            autocompleteState.properties.splice(action.payload, 1);
            return { ...autocompleteState };
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
