import React, { FC } from 'react';
import { Pagination as ReactstrapPagination, PaginationProps } from 'reactstrap';

const Pagination: FC<PaginationProps> = ({ children, ...rest }) => {
    return <ReactstrapPagination {...rest}>{children}</ReactstrapPagination>;
};

export default Pagination;
