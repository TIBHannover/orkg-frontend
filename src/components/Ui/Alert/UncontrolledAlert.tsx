import React, { FC } from 'react';
import { UncontrolledAlert as ReactstrapUncontrolledAlert, UncontrolledAlertProps } from 'reactstrap';

const UncontrolledAlert: FC<UncontrolledAlertProps> = ({ children, ...rest }) => {
    return <ReactstrapUncontrolledAlert {...rest}>{children}</ReactstrapUncontrolledAlert>;
};

export default UncontrolledAlert;
