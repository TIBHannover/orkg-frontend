import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StoryFn } from '@storybook/nextjs-vite';
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
        <Button
            tag={Link}
            color="secondary"
            size="sm"
            className="inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-secondary-solid text-white hover:bg-secondary-solid-hover focus:ring-secondary px-3 py-1.5 text-xs shrink-0"
            href="https://orkg.org"
        >
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
        <Container>
            <div className="box rounded p-6 flow-root">Lorum ipsum dolor sit amet</div>
        </Container>
    </div>
);

export const WithContainer = TemplateWithContainer.bind({});

WithContainer.args = {
    ...Default.args,
};
