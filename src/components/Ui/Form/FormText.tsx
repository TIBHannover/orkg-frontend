import React, { FC } from 'react';
import { FormText as ReactstrapFormText, FormTextProps } from 'reactstrap';

const FormText: FC<FormTextProps> = ({ children, ...rest }) => {
    return <ReactstrapFormText {...rest}>{children}</ReactstrapFormText>;
};

export default FormText;
