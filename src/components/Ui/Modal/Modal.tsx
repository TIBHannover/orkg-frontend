import React, { FC } from 'react';
import { Modal as ReactstrapModal, ModalProps } from 'reactstrap';

const Modal: FC<ModalProps> = ({ children, ...rest }) => {
    return <ReactstrapModal {...rest}>{children}</ReactstrapModal>;
};

export default Modal;
