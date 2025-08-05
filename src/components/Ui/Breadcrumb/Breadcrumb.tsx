import React, { FC } from 'react';
import { Breadcrumb as ReactstrapBreadcrumb, BreadcrumbProps } from 'reactstrap';

const Breadcrumb: FC<BreadcrumbProps> = ({ children, ...rest }) => {
    return <ReactstrapBreadcrumb {...rest}>{children}</ReactstrapBreadcrumb>;
};

export default Breadcrumb;
