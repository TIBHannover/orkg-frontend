import React, { FC } from 'react';
import { OffcanvasBody as ReactstrapOffcanvasBody, OffcanvasBodyProps } from 'reactstrap';

const OffcanvasBody: FC<OffcanvasBodyProps> = ({ children, ...rest }) => {
    return <ReactstrapOffcanvasBody {...rest}>{children}</ReactstrapOffcanvasBody>;
};

export default OffcanvasBody;
