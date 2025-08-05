import React, { FC } from 'react';
import { CardImg as ReactstrapCardImg, CardImgProps } from 'reactstrap';

const CardImg: FC<CardImgProps> = ({ children, ...rest }) => {
    return <ReactstrapCardImg {...rest}>{children}</ReactstrapCardImg>;
};

export default CardImg;
