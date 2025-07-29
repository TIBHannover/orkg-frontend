import React, { FC } from 'react';
import { DropdownToggle as DropdownToggleReactstrap, DropdownToggleProps } from 'reactstrap';

const DropdownToggle: FC<DropdownToggleProps> = ({ children, ...rest }) => {
    return <DropdownToggleReactstrap {...rest}>{children}</DropdownToggleReactstrap>;
};

export default DropdownToggle;
