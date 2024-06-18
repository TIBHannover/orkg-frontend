import { Ontology } from 'components/Autocomplete/types';
import { DEFAULT_SOURCES, STORAGE_NAME } from 'constants/autocompleteSources';
import { Dispatch, FC, ReactNode, createContext, useContext, useEffect, useReducer } from 'react';
import { MultiValue } from 'react-select';
import { asyncLocalStorage } from 'utils';

type AutocompleteState = {
    isOntologySelectorIsOpen: boolean;
    selectedOntologies: MultiValue<Ontology>;
};

type AutocompleteAction = { type: 'toggleOntologySelector'; payload: null } | { type: 'setOntologies'; payload: MultiValue<Ontology> };

const initialState = { isOntologySelectorIsOpen: false, selectedOntologies: DEFAULT_SOURCES };

export const AutocompleteContext = createContext<AutocompleteState>(initialState);
export const AutocompleteDispatchContext = createContext<Dispatch<AutocompleteAction>>(() => {});

export const autocompleteReducer = (autocompleteState: AutocompleteState, action: AutocompleteAction) => {
    switch (action.type) {
        case 'toggleOntologySelector': {
            return { ...autocompleteState, isOntologySelectorIsOpen: !autocompleteState.isOntologySelectorIsOpen };
        }
        case 'setOntologies': {
            return { ...autocompleteState, selectedOntologies: action.payload };
        }
        default: {
            throw Error('Unknown action');
        }
    }
};

export function useAutocompleteState() {
    return useContext(AutocompleteContext);
}

export function useAutocompleteDispatch() {
    return useContext(AutocompleteDispatchContext);
}

const AutocompleteProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [autocompleteState, dispatch] = useReducer(autocompleteReducer, initialState);

    useEffect(() => {
        const getSources = async () => {
            const data = await asyncLocalStorage.getItem(STORAGE_NAME);
            try {
                const parsedData = JSON.parse(data ?? '[]') as MultiValue<Ontology>;
                if (data && Array.isArray(parsedData)) {
                    dispatch({ type: 'setOntologies', payload: parsedData });
                }
            } catch (e) {
                console.error(e);
            }
        };
        getSources();
    }, []);

    return (
        <AutocompleteContext.Provider value={autocompleteState}>
            <AutocompleteDispatchContext.Provider value={dispatch}>{children}</AutocompleteDispatchContext.Provider>
        </AutocompleteContext.Provider>
    );
};

export default AutocompleteProvider;
