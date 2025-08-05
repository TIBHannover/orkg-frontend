import React, { FC } from 'react';
import { TabPane as ReactstrapTabPane, TabPaneProps } from 'reactstrap';

const TabPane: FC<TabPaneProps> = ({ children, ...rest }) => {
    return <ReactstrapTabPane {...rest}>{children}</ReactstrapTabPane>;
};

export default TabPane;
