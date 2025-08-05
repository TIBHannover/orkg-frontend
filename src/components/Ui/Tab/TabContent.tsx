import React, { FC } from 'react';
import { TabContent as ReactstrapTabContent, TabContentProps } from 'reactstrap';

const TabContent: FC<TabContentProps> = ({ children, ...rest }) => {
    return <ReactstrapTabContent {...rest}>{children}</ReactstrapTabContent>;
};

export default TabContent;
