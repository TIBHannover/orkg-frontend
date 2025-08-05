import React, { FC } from 'react';
import { PaginationLink as ReactstrapPaginationLink, PaginationLinkProps } from 'reactstrap';

const PaginationLink: FC<PaginationLinkProps> = ({ children, ...rest }) => {
    return <ReactstrapPaginationLink {...rest}>{children}</ReactstrapPaginationLink>;
};

export default PaginationLink;
