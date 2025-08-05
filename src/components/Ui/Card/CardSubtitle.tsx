import React, { FC } from 'react';
import { CardSubtitle as ReactstrapCardSubtitle, CardSubtitleProps } from 'reactstrap';

const CardSubtitle: FC<CardSubtitleProps> = ({ children, ...rest }) => {
    return <ReactstrapCardSubtitle {...rest}>{children}</ReactstrapCardSubtitle>;
};

export default CardSubtitle;
