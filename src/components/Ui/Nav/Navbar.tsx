import React, { FC } from 'react';
import { Navbar as NavbarReactstrap, NavbarProps } from 'reactstrap';

const Navbar: FC<NavbarProps> = ({ children, ...rest }) => {
    return <NavbarReactstrap {...rest}>{children}</NavbarReactstrap>;
};

export default Navbar;
