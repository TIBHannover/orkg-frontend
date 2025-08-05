import React, { FC } from 'react';
import { Table as ReactstrapTable, TableProps } from 'reactstrap';

const Table: FC<TableProps> = ({ children, ...rest }) => {
    return <ReactstrapTable {...rest}>{children}</ReactstrapTable>;
};

export default Table;
