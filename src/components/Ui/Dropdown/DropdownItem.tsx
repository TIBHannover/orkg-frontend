import React, { FC } from 'react';
import { DropdownItem as DropdownItemReactstrap, DropdownItemProps } from 'reactstrap';

const Dropdown: FC<DropdownItemProps> = ({ children, ...rest }) => {
    return <DropdownItemReactstrap {...rest}>{children}</DropdownItemReactstrap>;
};
export default Dropdown;
