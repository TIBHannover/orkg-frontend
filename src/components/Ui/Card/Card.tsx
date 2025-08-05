import React, { FC } from 'react';
import { Card as ReactstrapCard, CardProps } from 'reactstrap';

const Card: FC<CardProps> = ({ children, ...rest }) => {
    return <ReactstrapCard {...rest}>{children}</ReactstrapCard>;
};

export default Card;
