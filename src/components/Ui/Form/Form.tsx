import React, { FC } from 'react';
import { Form as ReactstrapForm, FormProps } from 'reactstrap';

const Form: FC<FormProps> = ({ children, ...rest }) => {
    return <ReactstrapForm {...rest}>{children}</ReactstrapForm>;
};

export default Form;
