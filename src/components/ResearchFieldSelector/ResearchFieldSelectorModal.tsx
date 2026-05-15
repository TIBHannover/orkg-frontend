import { Button, Modal } from '@heroui/react';
import { FC, useCallback, useState } from 'react';

import ResearchFieldSelector from '@/components/ResearchFieldSelector/ResearchFieldSelector';
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

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog className="max-w-3xl">
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Choose research field</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        <ResearchFieldSelector
                            updateResearchField={handleUpdate}
                            selectedResearchFieldId={selectedResearchField?.id ?? RESOURCES.RESEARCH_FIELD_MAIN}
                            insideModal
                            title={title}
                            abstract={abstract}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onPress={handleSelect} isDisabled={!selectedResearchField}>
                            Select
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ResearchFieldSelectorModal;
