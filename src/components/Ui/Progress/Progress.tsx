import React, { FC } from 'react';
import { Progress as ReactstrapProgress, ProgressProps } from 'reactstrap';

const Progress: FC<ProgressProps> = ({ children, ...rest }) => {
    return <ReactstrapProgress {...rest}>{children}</ReactstrapProgress>;
};

export default Progress;
