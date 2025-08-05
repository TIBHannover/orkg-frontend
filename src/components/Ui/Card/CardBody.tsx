import React, { FC } from 'react';
import { CardBody as ReactstrapCardBody, CardBodyProps } from 'reactstrap';

const CardBody: FC<CardBodyProps> = ({ children, ...rest }) => {
    return <ReactstrapCardBody {...rest}>{children}</ReactstrapCardBody>;
};

export default CardBody;
