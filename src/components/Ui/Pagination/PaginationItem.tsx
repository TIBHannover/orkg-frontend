import React, { FC } from 'react';
import { PaginationItem as ReactstrapPaginationItem, PaginationItemProps } from 'reactstrap';

const PaginationItem: FC<PaginationItemProps> = ({ children, ...rest }) => {
    return <ReactstrapPaginationItem {...rest}>{children}</ReactstrapPaginationItem>;
};

export default PaginationItem;
