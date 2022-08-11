import ResearchFieldSelector from 'components/ResearchFieldSelector/ResearchFieldSelector';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const ResearchFieldSelectorModal = ({ isOpen, toggle, onSelectField }) => {
    const [selectedResearchField, setSelectedResearchField] = useState('');
    const [researchFields, setResearchFields] = useState([]);

    const handleUpdate = useCallback(
        (data, submit = false) => {
            if (data.selectedResearchField) {
                setSelectedResearchField(data.selectedResearchField);
            }
            if (data.researchFields) {
                setResearchFields(data.researchFields);
            }
            if (submit) {
                onSelectField({
                    id: data.selectedResearchField,
                    label: data.selectedResearchFieldLabel || '',
                });
                toggle();
            }
        },
        [onSelectField, toggle],
    );

    const handleSelect = () => {
        const field = researchFields.find(rf => rf.id === selectedResearchField);
        onSelectField({
            id: selectedResearchField,
            label: field.label || '',
        });
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Choose research field</ModalHeader>
            <ModalBody>
                <ResearchFieldSelector
                    selectedResearchField={selectedResearchField}
                    researchFields={researchFields}
                    updateResearchField={handleUpdate}
                    insideModal={true}
                />
            </ModalBody>
            <ModalFooter className="d-flex">
                <Button color="primary" className="float-end" onClick={handleSelect} disabled={!selectedResearchField}>
                    Select
                </Button>
            </ModalFooter>
        </Modal>
    );
};

ResearchFieldSelectorModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onSelectField: PropTypes.func.isRequired,
};

export default ResearchFieldSelectorModal;
