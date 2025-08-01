import React, { FC } from 'react';
import { Popover as ReactstrapPopover, PopoverProps } from 'reactstrap';

const Popover: FC<PopoverProps> = ({ children, ...rest }) => {
    return <ReactstrapPopover {...rest}>{children}</ReactstrapPopover>;
};

export default Popover;
