import React, { FC, PropsWithChildren } from 'react';
import { Button as ReactstrapButton, ButtonProps as ReactstrapButtonProps } from 'reactstrap';

export type ButtonProps = ReactstrapButtonProps;

const Button: FC<PropsWithChildren<ButtonProps>> = ({ children, ...rest }) => {
    return <ReactstrapButton {...rest}>{children}</ReactstrapButton>;
};

export default Button;
