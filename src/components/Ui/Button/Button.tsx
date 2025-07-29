import React, { FC } from 'react';
import { Button as ButtonReactstrap, ButtonProps } from 'reactstrap';

const Button: FC<ButtonProps> = ({ children, ...rest }) => {
    return <ButtonReactstrap {...rest}>{children}</ButtonReactstrap>;
};

export default Button;
