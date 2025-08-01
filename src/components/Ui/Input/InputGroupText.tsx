import React, { FC } from 'react';
import { InputGroupText as ReactstrapInputGroupText, InputGroupTextProps } from 'reactstrap';

const InputGroupText: FC<InputGroupTextProps> = ({ children, ...rest }) => {
    return <ReactstrapInputGroupText {...rest}>{children}</ReactstrapInputGroupText>;
};

export default InputGroupText;
