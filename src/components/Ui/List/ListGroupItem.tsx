import React, { FC } from 'react';
import { ListGroupItem as ReactstrapListGroupItem, ListGroupItemProps } from 'reactstrap';

const ListGroupItem: FC<ListGroupItemProps> = ({ children, ...rest }) => {
    return <ReactstrapListGroupItem {...rest}>{children}</ReactstrapListGroupItem>;
};

export default ListGroupItem;
