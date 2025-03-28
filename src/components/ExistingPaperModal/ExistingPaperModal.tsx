import { FC } from 'react';
import { Alert, Modal, ModalBody, ModalHeader } from 'reactstrap';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import { Paper } from '@/services/backend/types';

type ExistingPaperModalProps = {
    paper: Paper;
    toggle: () => void;
};

const ExistingPaperModal: FC<ExistingPaperModalProps> = ({ paper, toggle }) => (
    <Modal size="lg" isOpen backdrop="static">
        <ModalHeader toggle={toggle}>Error: Paper already in ORKG</ModalHeader>
        <ModalBody>
            <Alert color="danger">
                A paper exists already in the ORKG so it cannot be added again. Please view the paper and contribute to improve the content.
            </Alert>
            <strong>Existing paper</strong>
            <div className="list-group">
                <PaperCard paper={paper} showAddToComparison={false} />
            </div>
        </ModalBody>
    </Modal>
);

export default ExistingPaperModal;
