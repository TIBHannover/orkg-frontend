import React, { FC } from 'react';
import { Alert as ReactstrapAlert, AlertProps } from 'reactstrap';

const Alert: FC<AlertProps> = ({ children, ...rest }) => {
    return <ReactstrapAlert {...rest}>{children}</ReactstrapAlert>;
};

export default Alert;
