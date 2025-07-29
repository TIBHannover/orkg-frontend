import React, { FC } from 'react';
import { ButtonDropdown as ButtonDropdownReactstrap, ButtonDropdownProps } from 'reactstrap';

const ButtonDropdown: FC<ButtonDropdownProps> = ({ children, ...rest }) => {
    return <ButtonDropdownReactstrap {...rest}>{children}</ButtonDropdownReactstrap>;
};

export default ButtonDropdown;
