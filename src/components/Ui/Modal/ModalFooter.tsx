import React, { FC } from 'react';
import { ModalFooter as ReactstrapModalFooter, ModalFooterProps } from 'reactstrap';

const ModalFooter: FC<ModalFooterProps> = ({ children, ...rest }) => {
    return <ReactstrapModalFooter {...rest}>{children}</ReactstrapModalFooter>;
};

export default ModalFooter;
