import React, { FC } from 'react';
import { Label as ReactstrapLabel, LabelProps } from 'reactstrap';

const Label: FC<LabelProps> = ({ children, ...rest }) => {
    return <ReactstrapLabel {...rest}>{children}</ReactstrapLabel>;
};

export default Label;
