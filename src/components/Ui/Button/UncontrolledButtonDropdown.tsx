import React, { FC } from 'react';
import { UncontrolledButtonDropdown as ReactstrapUncontrolledButtonDropdown, UncontrolledButtonDropdownProps } from 'reactstrap';

const UncontrolledButtonDropdown: FC<UncontrolledButtonDropdownProps> = ({ children, ...rest }) => {
    return <ReactstrapUncontrolledButtonDropdown {...rest}>{children}</ReactstrapUncontrolledButtonDropdown>;
};

export default UncontrolledButtonDropdown;
