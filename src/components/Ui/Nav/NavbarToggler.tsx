import React, { FC } from 'react';
import { NavbarToggler as NavbarTogglerReactstrap, NavbarTogglerProps } from 'reactstrap';

const NavbarToggler: FC<NavbarTogglerProps> = ({ children, ...rest }) => {
    return <NavbarTogglerReactstrap {...rest}>{children}</NavbarTogglerReactstrap>;
};

export default NavbarToggler;
