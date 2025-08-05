import React, { FC } from 'react';
import { Offcanvas as ReactstrapOffcanvas, OffcanvasProps } from 'reactstrap';

const Offcanvas: FC<OffcanvasProps> = ({ children, ...rest }) => {
    return <ReactstrapOffcanvas {...rest}>{children}</ReactstrapOffcanvas>;
};

export default Offcanvas;
