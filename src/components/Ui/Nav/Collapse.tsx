import React, { FC } from 'react';
import { Collapse as CollapseReactstrap, CollapseProps } from 'reactstrap';

const Collapse: FC<CollapseProps> = ({ children, ...rest }) => {
    return <CollapseReactstrap {...rest}>{children}</CollapseReactstrap>;
};

export default Collapse;
