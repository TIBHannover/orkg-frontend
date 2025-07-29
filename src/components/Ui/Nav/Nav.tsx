import React, { FC } from 'react';
import { Nav as NavReactstrap, NavProps } from 'reactstrap';

const Nav: FC<NavProps> = ({ children, ...rest }) => {
    return <NavReactstrap {...rest}>{children}</NavReactstrap>;
};

export default Nav;
