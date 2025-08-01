import React, { FC } from 'react';
import { InputGroup as ReactstrapInputGroup, InputGroupProps } from 'reactstrap';

const InputGroup: FC<InputGroupProps> = ({ children, ...rest }) => {
    return <ReactstrapInputGroup {...rest}>{children}</ReactstrapInputGroup>;
};

export default InputGroup;
