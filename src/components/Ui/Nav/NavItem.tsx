import React, { FC } from 'react';
import { NavItem as NavItemReactstrap, NavItemProps } from 'reactstrap';

const NavItem: FC<NavItemProps> = ({ children, ...rest }) => {
    return <NavItemReactstrap {...rest}>{children}</NavItemReactstrap>;
};

export default NavItem;
