import React, { FC } from 'react';
import { Container as ReactstrapContainer, ContainerProps } from 'reactstrap';

const Container: FC<ContainerProps> = ({ children, ...rest }) => {
    return <ReactstrapContainer {...rest}>{children}</ReactstrapContainer>;
};

export default Container;
