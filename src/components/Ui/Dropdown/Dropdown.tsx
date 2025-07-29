import React, { FC } from 'react';
import { Dropdown as DropdownReactstrap, DropdownProps } from 'reactstrap';

const Dropdown: FC<DropdownProps> = ({ children, ...rest }) => {
    return <DropdownReactstrap {...rest}>{children}</DropdownReactstrap>;
};
export default Dropdown;
