import React, { FC } from 'react';
import { DropdownMenu as DropdownMenuReactstrap, DropdownMenuProps } from 'reactstrap';

const DropdownMenu: FC<DropdownMenuProps> = ({ children, ...rest }) => {
    return <DropdownMenuReactstrap {...rest}>{children}</DropdownMenuReactstrap>;
};
export default DropdownMenu;
