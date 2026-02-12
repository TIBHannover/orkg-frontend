import { StoryFn } from '@storybook/nextjs';

import ShortRecord from '@/components/ShortRecord/ShortRecord';
import ListGroup from '@/components/Ui/List/ListGroup';

export default {
    title: 'ShortRecord',
    component: ShortRecord,
};

const Template: StoryFn<typeof ShortRecord> = (args) => <ShortRecord {...args} />;

export const Default = Template.bind({});

Default.args = {
    href: 'https://orkg.org/resource/R100',
    children: 'R100',
    header: 'Example label',
};

export const WithoutLabel = Template.bind({});

WithoutLabel.args = {
    href: 'https://orkg.org/resource/R100',
    children: 'R100',
    header: '',
};

const TemplateWithinList: StoryFn<typeof ShortRecord> = (args) => (
    <ListGroup>
        <ShortRecord {...args} />
        <ShortRecord {...args} />
        <ShortRecord {...args} />
    </ListGroup>
);

export const WithinList = TemplateWithinList.bind({});

WithinList.args = {
    href: 'https://orkg.org/resource/R100',
    children: 'R100',
    header: '',
};
