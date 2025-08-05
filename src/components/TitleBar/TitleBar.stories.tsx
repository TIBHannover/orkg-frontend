import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StoryFn } from '@storybook/react';
import Link from 'next/link';

import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';

export default {
    title: 'TitleBar',
    component: TitleBar,
    argTypes: {
        buttonGroup: {
            control: {
                disable: true,
            },
        },
    },
};

const Template: StoryFn<typeof TitleBar> = (args) => <TitleBar {...args} />;

export const Default = Template.bind({});

Default.args = {
    buttonGroup: null,
    titleAddition: '100 items',
    children: 'Paper list',
    wrap: false,
    titleSize: 'h4',
};

export const WithButtonGroup = Template.bind({});

WithButtonGroup.args = {
    ...Default.args,
    buttonGroup: (
        <Button component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm flex-shrink-0" href="https://orkg.org">
            <FontAwesomeIcon icon={faPlus} /> Create paper
        </Button>
    ),
};

export const WithoutTitleAddition = Template.bind({});

WithoutTitleAddition.args = {
    ...Default.args,
    titleAddition: '',
};

const TemplateWithContainer: StoryFn<typeof TitleBar> = (args) => (
    <div style={{ background: 'WhiteSmoke', padding: '10px 10px 50px 10px' }}>
        <TitleBar {...args} />
        <Container className="box rounded p-4 clearfix">Lorum ipsum dolor sit amet</Container>
    </div>
);

export const WithContainer = TemplateWithContainer.bind({});

WithContainer.args = {
    ...Default.args,
};
