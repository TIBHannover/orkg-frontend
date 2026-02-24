import { FC } from 'react';

import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type RelatedFigureModalProps = {
    toggle: () => void;
    src: string;
    title?: string;
    description?: string;
};

const RelatedFigureModal: FC<RelatedFigureModalProps> = ({ toggle, src, title, description }) => (
    <Modal isOpen toggle={toggle} style={{ maxWidth: '100%', width: 'fit-content' }}>
        <ModalHeader toggle={toggle}>Related image {title ? ` - ${title}` : null}</ModalHeader>
        <ModalBody>
            <img src={src} alt={title} className="img-fluid" />
            <p>{description}</p>
        </ModalBody>
    </Modal>
);

export default RelatedFigureModal;
