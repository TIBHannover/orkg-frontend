import React, { FC } from 'react';
import { UncontrolledButtonDropdown as UncontrolledButtonDropdownReactstrap, UncontrolledButtonDropdownProps } from 'reactstrap';

const UncontrolledButtonDropdown: FC<UncontrolledButtonDropdownProps> = ({ children, ...rest }) => {
    return <UncontrolledButtonDropdownReactstrap {...rest}>{children}</UncontrolledButtonDropdownReactstrap>;
};

export default UncontrolledButtonDropdown;
