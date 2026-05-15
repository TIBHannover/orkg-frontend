import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Label, Modal, toast } from '@heroui/react';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { MultiValue } from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';

import { useAutocompleteDispatch, useAutocompleteState } from '@/components/Autocomplete/AutocompleteContext';
import { CustomOption } from '@/components/Autocomplete/OntologiesModal/CustomOption';
import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import { AdditionalType, Ontology } from '@/components/Autocomplete/types';
import { AUTOCOMPLETE_SOURCE, DEFAULT_SOURCES, STORAGE_NAME } from '@/constants/autocompleteSources';
import { loadOntologiesOptions } from '@/services/ols';
import { asyncLocalStorage } from '@/utils';

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
            toast.danger('Select at least one source');
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
        <Modal.Backdrop isOpen={isOntologySelectorIsOpen} onOpenChange={(open) => !open && toggle()} isDismissable>
            <Modal.Container>
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Select sources</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flex justify-between items-end">
                            <Label className="mb-0">Select search sources from below</Label>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="mt-2"
                                isDisabled={isEqual(value, defaultSelection)}
                                onPress={handleReset}
                            >
                                <FontAwesomeIcon icon={faArrowRotateLeft} /> Reset
                            </Button>
                        </div>
                        <div className="mb-4 mt-1">
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
                                classNames={customClassNames as any}
                                styles={customStyles as any}
                                menuPosition="fixed"
                                debounceTimeout={300}
                                getOptionValue={({ id }) => id}
                                components={{
                                    Option: CustomOption,
                                }}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onPress={toggle}>
                            Cancel
                        </Button>
                        <Button variant="primary" onPress={handleSelect}>
                            Select
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default OntologiesModal;
