import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';

export default {
    title: 'ShareLinkMarker',
    component: ShareLinkMarker,
};

const Template = (args) => (
    <div style={{ width: '90%', height: 200, position: 'relative', backgroundColor: 'WhiteSmoke' }}>
        <ShareLinkMarker {...args} />
    </div>
);

export const Default = Template.bind({});

Default.args = {
    typeOfLink: 'paper',
    title: 'Open research knowledge graph: next generation infrastructure for semantic scholarly knowledge',
};
