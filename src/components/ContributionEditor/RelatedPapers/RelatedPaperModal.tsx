import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { SimilarPaper } from 'services/orkgSimpaper/types';

interface RelatedPaperModalProps {
    isOpen: boolean;
    toggle: () => void;
    paper: SimilarPaper | undefined;
}

const RelatedPaperModal: React.FC<RelatedPaperModalProps> = ({ isOpen, toggle, paper }) => (
    <Modal isOpen={isOpen} toggle={toggle}>
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
