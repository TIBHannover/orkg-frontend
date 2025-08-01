import { FC, useCallback, useState } from 'react';

import ResearchFieldSelector from '@/components/ResearchFieldSelector/ResearchFieldSelector';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { RESOURCES } from '@/constants/graphSettings';
import { Node } from '@/services/backend/types';

type ResearchFieldSelectorModalProps = {
    isOpen: boolean;
    toggle: () => void;
    onSelectField: (field: Node) => void;
    title?: string | null;
    abstract?: string | null;
};

const ResearchFieldSelectorModal: FC<ResearchFieldSelectorModalProps> = ({ isOpen, toggle, onSelectField, title = null, abstract = null }) => {
    const [selectedResearchField, setSelectedResearchField] = useState<Node | null>(null);

    const handleUpdate = useCallback(
        (selected?: Node, submit?: boolean) => {
            if (selected) {
                setSelectedResearchField(selected);
            }
            if (submit && selected) {
                onSelectField({
                    id: selected.id,
                    label: selected.label,
                });
                toggle();
            }
        },
        [onSelectField, toggle],
    );

    const handleSelect = () => {
        onSelectField({
            id: selectedResearchField?.id ?? '',
            label: selectedResearchField?.label ?? '',
        });
        toggle();
    };

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Choose research field</ModalHeader>
            <ModalBody>
                <ResearchFieldSelector
                    updateResearchField={handleUpdate}
                    selectedResearchFieldId={selectedResearchField?.id ?? RESOURCES.RESEARCH_FIELD_MAIN}
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
