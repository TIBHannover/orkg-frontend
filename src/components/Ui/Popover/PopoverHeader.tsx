import React, { FC } from 'react';
import { PopoverHeader as ReactstrapPopoverHeader, PopoverHeaderProps } from 'reactstrap';

const PopoverHeader: FC<PopoverHeaderProps> = ({ children, ...rest }) => {
    return <ReactstrapPopoverHeader {...rest}>{children}</ReactstrapPopoverHeader>;
};

export default PopoverHeader;
