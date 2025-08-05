import React, { FC } from 'react';
import { ListGroup as ReactstrapListGroup, ListGroupProps } from 'reactstrap';

const ListGroup: FC<ListGroupProps> = ({ children, ...rest }) => {
    return <ReactstrapListGroup {...rest}>{children}</ReactstrapListGroup>;
};

export default ListGroup;
