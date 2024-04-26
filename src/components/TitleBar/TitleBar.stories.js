import Link from 'components/NextJsMigration/Link';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import TitleBar from 'components/TitleBar/TitleBar';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Button, Container } from 'reactstrap';

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

const Template = (args) => <TitleBar {...args} />;

export const Default = Template.bind({});

Default.args = {
    buttonGroup: null,
    titleAddition: '100 items',
    children: 'Paper list',
    wrap: '',
    titleSize: 'h4',
};

export const WithButtonGroup = Template.bind({});

WithButtonGroup.args = {
    ...Default.args,
    buttonGroup: (
        <Button component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm flex-shrink-0" href="https://orkg.org">
            <Icon icon={faPlus} /> Create paper
        </Button>
    ),
};

export const WithoutTitleAddition = Template.bind({});

WithoutTitleAddition.args = {
    ...Default.args,
    titleAddition: '',
};

const TemplateWithContainer = (args) => (
    <div style={{ background: 'WhiteSmoke', padding: '10px 10px 50px 10px' }}>
        <TitleBar {...args} />
        <Container className="box rounded p-4 clearfix">Lorum ipsum dolor sit amet</Container>
    </div>
);

export const WithContainer = TemplateWithContainer.bind({});

WithContainer.args = {
    ...Default.args,
};
