import React, { FC, PropsWithChildren } from 'react';
import { Navbar as ReactstrapNavbar, NavbarProps as ReactstrapNavbarProps } from 'reactstrap';

export type NavbarProps = ReactstrapNavbarProps;

const Navbar: FC<PropsWithChildren<NavbarProps>> = ({ children, ...rest }) => {
    return <ReactstrapNavbar {...rest}>{children}</ReactstrapNavbar>;
};

export default Navbar;
