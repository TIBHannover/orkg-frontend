import Tabs, { TabsProps } from '@rc-component/tabs';
import React, { FC } from 'react';

import { ORKGTabsStyle } from '@/components/Tabs/styled';

type ORKGTabsProps = TabsProps &
    React.RefAttributes<HTMLDivElement> & {
        className?: string;
        style?: React.CSSProperties;
        activeKey?: string;
    };

const ORKGTabs: FC<ORKGTabsProps> = ({ style = {}, className, ...props }) => (
    <ORKGTabsStyle className={className} style={style}>
        <Tabs {...props} getPopupContainer={(trigger: HTMLElement) => trigger.parentNode as HTMLElement} />
    </ORKGTabsStyle>
);

export default ORKGTabs;
