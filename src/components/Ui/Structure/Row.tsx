import React, { FC } from 'react';
import { Row as ReactstrapRow, RowProps } from 'reactstrap';

const Row: FC<RowProps> = ({ children, ...rest }) => {
    return <ReactstrapRow {...rest}>{children}</ReactstrapRow>;
};

export default Row;
