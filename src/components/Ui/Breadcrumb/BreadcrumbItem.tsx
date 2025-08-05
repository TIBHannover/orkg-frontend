import React, { FC } from 'react';
import { BreadcrumbItem as BreadcrumbItemReactstrap, BreadcrumbItemProps } from 'reactstrap';

const BreadcrumbItem: FC<BreadcrumbItemProps> = ({ children, ...rest }) => {
    return <BreadcrumbItemReactstrap {...rest}>{children}</BreadcrumbItemReactstrap>;
};

export default BreadcrumbItem;
