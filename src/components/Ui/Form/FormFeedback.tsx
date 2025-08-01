import React, { FC } from 'react';
import { FormFeedback as ReactstrapFormFeedback, FormFeedbackProps } from 'reactstrap';

const FormFeedback: FC<FormFeedbackProps> = ({ children, ...rest }) => {
    return <ReactstrapFormFeedback {...rest}>{children}</ReactstrapFormFeedback>;
};

export default FormFeedback;
