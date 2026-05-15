import { Modal } from '@heroui/react';
import { CSSProperties, FC, ReactNode } from 'react';

type ModalBodyProps = {
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
};

const ModalBody: FC<ModalBodyProps> = ({ className, style, children }) => (
    <Modal.Body className={className} style={style}>
        {children}
    </Modal.Body>
);

export default ModalBody;
