import React, { FC } from 'react';
import { CardTitle as ReactstrapCardTitle, CardTitleProps } from 'reactstrap';

const CardTitle: FC<CardTitleProps> = ({ children, ...rest }) => {
    return <ReactstrapCardTitle {...rest}>{children}</ReactstrapCardTitle>;
};

export default CardTitle;
