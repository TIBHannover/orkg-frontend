import React, { FC } from 'react';
import { UncontrolledPopover as ReactstrapUncontrolledPopover, UncontrolledPopoverProps } from 'reactstrap';

const UncontrolledPopover: FC<UncontrolledPopoverProps> = ({ children, ...rest }) => {
    return <ReactstrapUncontrolledPopover {...rest}>{children}</ReactstrapUncontrolledPopover>;
};

export default UncontrolledPopover;
