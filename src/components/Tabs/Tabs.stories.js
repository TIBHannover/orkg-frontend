import Tabs from 'components/Tabs/Tabs';
import { useState } from 'react';

export default {
    title: 'Tabs',
    component: Tabs,
    argTypes: {
        activeKey: {
            control: {
                disable: true,
            },
        },
    },
};

const Template = args => {
    const [activeKey, setActiveKey] = useState(args.activeKey ?? 1);

    return (
        <Tabs
            {...args}
            activeKey={activeKey}
            onChange={(...params) => {
                args.onChange(...params);
                setActiveKey(...params);
            }}
        />
    );
};

export const Default = Template.bind({});

Default.args = {
    activeKey: 1,
    onChange: () => {},
    destroyInactiveTabPane: true,
    moreIcon: '>',
    items: [
        {
            label: 'Tab 1',
            key: 1,
            children: <div>Tab 1 content</div>,
        },
        {
            label: 'Tab 2',
            key: 2,
            children: <div>Tab 2 content</div>,
        },
        {
            label: 'Tab 3',
            key: 3,
            children: <div>Tab 3 content</div>,
        },
    ],
    tabBarExtraContent: null,
};

export const ExtraContent = Template.bind({});

ExtraContent.args = {
    ...Default.args,
    tabBarExtraContent: 'Extra content',
};
