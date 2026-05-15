import { Modal } from '@heroui/react';
import React from 'react';

import { SimilarPaper } from '@/services/orkgSimpaper/types';

interface RelatedPaperModalProps {
    isOpen: boolean;
    toggle: () => void;
    paper: SimilarPaper | undefined;
}

const RelatedPaperModal: React.FC<RelatedPaperModalProps> = ({ isOpen, toggle, paper }) => (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={toggle}>
        <Modal.Container size="lg">
            <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                    <Modal.Heading>Paper details</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                    <h5 className="font-semibold mb-3">{paper?.title}</h5>
                    {paper?.abstract && (
                        <p className="text-sm leading-relaxed text-foreground">
                            <strong className="block mb-1 text-muted">Abstract</strong>
                            {paper.abstract}
                        </p>
                    )}
                </Modal.Body>
            </Modal.Dialog>
        </Modal.Container>
    </Modal.Backdrop>
);

export default RelatedPaperModal;
