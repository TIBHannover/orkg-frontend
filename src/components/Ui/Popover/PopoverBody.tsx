import React, { FC } from 'react';
import { PopoverBody as ReactstrapPopoverBody, PopoverBodyProps } from 'reactstrap';

const PopoverBody: FC<PopoverBodyProps> = ({ children, ...rest }) => {
    return <ReactstrapPopoverBody {...rest}>{children}</ReactstrapPopoverBody>;
};

export default PopoverBody;
