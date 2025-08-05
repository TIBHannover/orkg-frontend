import React, { FC } from 'react';
import { CardFooter as ReactstrapCardFooter, CardFooterProps } from 'reactstrap';

const CardFooter: FC<CardFooterProps> = ({ children, ...rest }) => {
    return <ReactstrapCardFooter {...rest}>{children}</ReactstrapCardFooter>;
};

export default CardFooter;
