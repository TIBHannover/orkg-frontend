import ClassInstances from 'components/ClassInstances/ClassInstances';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import Tabs from 'components/Tabs/Tabs';
import { useNavigate, useParams } from 'react-router-dom';
import { Container } from 'reactstrap';
import InformationTab from './InformationTab';
import TreeView from './TreeView';

function TabsContainer({ id, label, uri, editMode }) {
    const { activeTab } = useParams();

    const navigate = useNavigate();

    const onTabChange = key => {
        navigate(
            `${reverse(ROUTES.CLASS_TABS, {
                id,
                activeTab: key,
            })}?noRedirect`,
        );
    };

    return (
        <Container className="mt-2 p-0">
            <Tabs
                className="box rounded"
                destroyInactiveTabPane={true}
                onChange={onTabChange}
                activeKey={activeTab ?? 'information'}
                items={[
                    {
                        label: 'Class information',
                        key: 'information',
                        children: <InformationTab uri={uri} id={id} label={label} editMode={editMode} />,
                    },
                    {
                        label: 'Tree view',
                        key: 'tree',
                        children: <TreeView id={id} label={label} />,
                    },
                    {
                        label: 'Instances',
                        key: 'instances',
                        children: <ClassInstances classId={id} />,
                    },
                ]}
            />
        </Container>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    uri: PropTypes.string,
    editMode: PropTypes.bool.isRequired,
};

export default TabsContainer;
