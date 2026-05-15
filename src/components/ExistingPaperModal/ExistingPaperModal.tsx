import { Alert, Modal } from '@heroui/react';
import { FC } from 'react';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import { Paper } from '@/services/backend/types';

type ExistingPaperModalProps = {
    paper: Paper;
    toggle: () => void;
};

const ExistingPaperModal: FC<ExistingPaperModalProps> = ({ paper, toggle }) => (
    <Modal.Backdrop
        isOpen
        isDismissable={false}
        onOpenChange={(open) => {
            if (!open) toggle();
        }}
    >
        <Modal.Container size="lg">
            <Modal.Dialog className="sm:max-w-4xl">
                <Modal.CloseTrigger className="!top-3 !right-3" />
                <Modal.Header>
                    <Modal.Heading>Paper already in ORKG</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4 p-1">
                    <Alert status="danger">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>This paper is already in the graph</Alert.Title>
                            <Alert.Description>
                                To avoid duplicates, it cannot be added again. Open the existing paper below to view or contribute to its content.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-default-500">Existing paper</p>
                        <div className="rounded border border-default-200">
                            <PaperCard paper={paper} showAddToComparison={false} />
                        </div>
                    </div>
                </Modal.Body>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default ExistingPaperModal;
