import { Modal } from '@heroui/react';
import { FC, ReactNode } from 'react';

type ModalFooterProps = {
    className?: string;
    children?: ReactNode;
};

const ModalFooter: FC<ModalFooterProps> = ({ className, children }) => <Modal.Footer className={className}>{children}</Modal.Footer>;

export default ModalFooter;
