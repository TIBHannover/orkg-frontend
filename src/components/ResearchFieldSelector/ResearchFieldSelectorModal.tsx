import ResearchFieldSelector, { ResearchField } from 'components/ResearchFieldSelector/ResearchFieldSelector';
import { FC, useCallback, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { Node } from 'services/backend/types';

type ResearchFieldSelectorModalProps = {
    isOpen: boolean;
    toggle: () => void;
    onSelectField: (field: Node) => void;
    title?: string | null;
    abstract?: string | null;
};

const ResearchFieldSelectorModal: FC<ResearchFieldSelectorModalProps> = ({ isOpen, toggle, onSelectField, title = null, abstract = null }) => {
    const [selectedResearchField, setSelectedResearchField] = useState('');
    const [researchFields, setResearchFields] = useState<ResearchField[]>([]);

    const handleUpdate = useCallback(
        (
            data: {
                researchFields: ResearchField[];
                selectedResearchField?: string;
                selectedResearchFieldLabel?: string;
            },
            submit = false,
        ) => {
            if (data.selectedResearchField) {
                setSelectedResearchField(data.selectedResearchField);
            }
            if (data.researchFields) {
                setResearchFields(data.researchFields);
            }
            if (submit) {
                onSelectField({
                    id: data.selectedResearchField || '',
                    label: data.selectedResearchFieldLabel || '',
                });
                toggle();
            }
        },
        [onSelectField, toggle],
    );

    const handleSelect = () => {
        const field = researchFields.find((rf) => rf.id === selectedResearchField);
        onSelectField({
            id: selectedResearchField,
            label: field?.label || '',
        });
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Choose research field</ModalHeader>
            <ModalBody>
                <ResearchFieldSelector
                    selectedResearchField={selectedResearchField}
                    researchFields={researchFields}
                    updateResearchField={handleUpdate}
                    insideModal
                    title={title}
                    abstract={abstract}
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

export default ResearchFieldSelectorModal;
