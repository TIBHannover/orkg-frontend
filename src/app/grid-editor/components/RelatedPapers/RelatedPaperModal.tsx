import React from 'react';

import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { SimilarPaper } from '@/services/orkgSimpaper/types';

interface RelatedPaperModalProps {
    isOpen: boolean;
    toggle: () => void;
    paper: SimilarPaper | undefined;
}

const RelatedPaperModal: React.FC<RelatedPaperModalProps> = ({ isOpen, toggle, paper }) => (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Paper details</ModalHeader>
        <ModalBody>
            <>
                <h5>{paper?.title}</h5>
                <p>
                    <b>Abstract: </b>
                    {paper?.abstract}
                </p>
            </>
        </ModalBody>
    </Modal>
);

export default RelatedPaperModal;
