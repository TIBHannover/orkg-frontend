import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAutocompleteDispatch, useAutocompleteState } from 'components/Autocomplete/AutocompleteContext';
import { CustomOption } from 'components/Autocomplete/OntologiesModal/CustomOption';
import { AdditionalType, Ontology } from 'components/Autocomplete/types';
import { AUTOCOMPLETE_SOURCE, DEFAULT_SOURCES, STORAGE_NAME } from 'constants/autocompleteSources';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { MultiValue } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import { toast } from 'react-toastify';
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { loadOntologiesOptions } from 'services/ols';
import { asyncLocalStorage } from 'utils';

const defaultAdditional: AdditionalType = {
    page: 0,
};

const OntologiesModal = () => {
    const dispatch = useAutocompleteDispatch();
    const { selectedOntologies, isOntologySelectorIsOpen } = useAutocompleteState();
    const toggle = () => dispatch({ type: 'toggleOntologySelector', payload: null });

    const [value, setValue] = useState<MultiValue<Ontology>>([]);

    const defaultSelection = DEFAULT_SOURCES.filter(
        (ontology) => ontology.id === AUTOCOMPLETE_SOURCE.ORKG || ontology.id === AUTOCOMPLETE_SOURCE.WIKIDATA,
    );

    const handleSelect = () => {
        if (value.length === 0) {
            toast.error('Select at least one source');
            return;
        }
        asyncLocalStorage.setItem(STORAGE_NAME, JSON.stringify(value));
        dispatch({ type: 'setOntologies', payload: value });
        toggle();
    };

    const handleReset = () => {
        setValue(defaultSelection);
    };

    useEffect(() => {
        setValue(selectedOntologies);
    }, [selectedOntologies]);

    return (
        <Modal isOpen={isOntologySelectorIsOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Select sources</ModalHeader>
            <ModalBody>
                <div className="d-flex justify-content-between align-items-end">
                    <Label for="source-selector" className="mb-0">
                        Select search sources from below
                    </Label>
                    <Button color="light" onClick={handleReset} size="sm" className="mt-2" disabled={isEqual(value, defaultSelection)}>
                        <FontAwesomeIcon icon={faArrowRotateLeft} /> Reset
                    </Button>
                </div>
                <div className="mb-3 mt-1">
                    <AsyncPaginate
                        additional={defaultAdditional}
                        onChange={(selected) => {
                            setValue(selected || []);
                        }}
                        loadOptions={loadOntologiesOptions}
                        placeholder="Select or type to enter an ontology"
                        value={value}
                        defaultOptions={DEFAULT_SOURCES}
                        openMenuOnFocus
                        isClearable
                        isMulti
                        classNamePrefix="react-select"
                        debounceTimeout={300}
                        getOptionValue={({ id }) => id}
                        components={{
                            Option: CustomOption,
                        }}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleSelect}>
                    Select
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default OntologiesModal;
