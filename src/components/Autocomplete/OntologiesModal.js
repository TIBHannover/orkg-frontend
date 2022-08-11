import AutoComplete, { DEFAULT_SOURCES } from 'components/Autocomplete/Autocomplete';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Button, Label, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { olsBaseUrl } from 'services/ols/index';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { isEqual } from 'lodash';

function OntologiesModal(props) {
    const [value, setValue] = useState('');
    const defaultSelection = DEFAULT_SOURCES.filter(ontology => ontology.id === 'ORKG' || ontology.id === 'Wikidata');

    useEffect(() => {
        setValue(props.selectedOntologies);
    }, [props.selectedOntologies]);

    const handleSelect = () => {
        if (value.length === 0) {
            toast.error('Select at least one source');
            return;
        }
        props.setSelectedOntologies(value);
        props.toggle();
    };

    const handleReset = () => {
        setValue(defaultSelection);
    };

    return (
        <Modal isOpen={true} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Select sources</ModalHeader>
            <ModalBody>
                <div className="d-flex justify-content-between align-items-end">
                    <Label for="source-selector" className="mb-0">
                        Select search sources from below
                    </Label>
                    <Button color="light" onClick={handleReset} size="sm" className="mt-2" disabled={isEqual(value, defaultSelection)}>
                        <Icon icon={faArrowRotateLeft} /> Reset
                    </Button>
                </div>
                <div className="mb-3 mt-1">
                    <AutoComplete
                        requestUrl={olsBaseUrl}
                        onChange={selected => {
                            setValue(selected || []);
                        }}
                        placeholder="Select or type to enter an ontology"
                        value={value}
                        autoLoadOption={true}
                        openMenuOnFocus={true}
                        allowCreate={false}
                        isClearable
                        isMulti
                        autoFocus={false}
                        ols={false}
                        additionalData={DEFAULT_SOURCES}
                        inputId="source-selector"
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="light" onClick={props.toggle}>
                    Cancel
                </Button>
                <Button color="primary" onClick={handleSelect}>
                    Select
                </Button>
            </ModalFooter>
        </Modal>
    );
}

OntologiesModal.propTypes = {
    toggle: PropTypes.func.isRequired,
    selectedOntologies: PropTypes.array.isRequired,
    setSelectedOntologies: PropTypes.func.isRequired,
};

export default OntologiesModal;
