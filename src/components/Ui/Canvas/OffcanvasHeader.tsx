import React, { FC } from 'react';
import { OffcanvasHeader as ReactstrapOffcanvasHeader, OffcanvasHeaderProps } from 'reactstrap';

const OffcanvasHeader: FC<OffcanvasHeaderProps> = ({ children, ...rest }) => {
    return <ReactstrapOffcanvasHeader {...rest}>{children}</ReactstrapOffcanvasHeader>;
};

export default OffcanvasHeader;
