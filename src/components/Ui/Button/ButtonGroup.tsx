import React, { FC } from 'react';
import { ButtonGroup as ButtonGroupReactstrap, ButtonGroupProps } from 'reactstrap';

const ButtonGroup: FC<ButtonGroupProps> = ({ children, ...rest }) => {
    return <ButtonGroupReactstrap {...rest}>{children}</ButtonGroupReactstrap>;
};

export default ButtonGroup;
