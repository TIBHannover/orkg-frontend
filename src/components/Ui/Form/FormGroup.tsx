import React, { FC } from 'react';
import { FormGroup as ReactstrapFormGroup, FormGroupProps } from 'reactstrap';

const FormGroup: FC<FormGroupProps> = ({ children, ...rest }) => {
    return <ReactstrapFormGroup {...rest}>{children}</ReactstrapFormGroup>;
};

export default FormGroup;
