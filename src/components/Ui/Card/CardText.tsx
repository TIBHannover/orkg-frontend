import React, { FC } from 'react';
import { CardText as ReactstrapCardText, CardTextProps } from 'reactstrap';

const CardText: FC<CardTextProps> = ({ children, ...rest }) => {
    return <ReactstrapCardText {...rest}>{children}</ReactstrapCardText>;
};

export default CardText;
