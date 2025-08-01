import React, { FC } from 'react';
import { ModalHeader as ReactstrapModalHeader, ModalHeaderProps } from 'reactstrap';

const ModalHeader: FC<ModalHeaderProps> = ({ children, ...rest }) => {
    return <ReactstrapModalHeader {...rest}>{children}</ReactstrapModalHeader>;
};

export default ModalHeader;
