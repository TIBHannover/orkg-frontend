import { Modal } from '@heroui/react';
import { FC, ReactNode } from 'react';

type ModalHeaderProps = {
    toggle?: () => void;
    className?: string;
    children?: ReactNode;
};

const ModalHeader: FC<ModalHeaderProps> = ({ toggle, className, children }) => (
    <Modal.Header className={className}>
        {toggle && <Modal.CloseTrigger />}
        <Modal.Heading>{children}</Modal.Heading>
    </Modal.Header>
);

export default ModalHeader;
