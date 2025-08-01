import React, { FC } from 'react';
import { ModalBody as ReactstrapModalBody, ModalBodyProps } from 'reactstrap';

const ModalBody: FC<ModalBodyProps> = ({ children, ...rest }) => {
    return <ReactstrapModalBody {...rest}>{children}</ReactstrapModalBody>;
};

export default ModalBody;
