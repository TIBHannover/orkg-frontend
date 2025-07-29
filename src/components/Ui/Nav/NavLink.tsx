import React, { FC } from 'react';
import { NavLink as NavLinkReactstrap, NavLinkProps } from 'reactstrap';

const NavLink: FC<NavLinkProps> = ({ children, ...rest }) => {
    return <NavLinkReactstrap {...rest}>{children}</NavLinkReactstrap>;
};

export default NavLink;
