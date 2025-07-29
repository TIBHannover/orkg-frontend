import React, { FC } from 'react';
import { Col as ReactstrapCol, ColProps } from 'reactstrap';

const Col: FC<ColProps> = ({ children, ...rest }) => {
    return <ReactstrapCol {...rest}>{children}</ReactstrapCol>;
};

export default Col;
