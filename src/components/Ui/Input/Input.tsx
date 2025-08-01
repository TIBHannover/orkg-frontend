import React, { FC } from 'react';
import { Input as ReactstrapInput, InputProps } from 'reactstrap';

const Input: FC<InputProps> = ({ children, ...rest }) => {
    return <ReactstrapInput {...rest}>{children}</ReactstrapInput>;
};

export default Input;
