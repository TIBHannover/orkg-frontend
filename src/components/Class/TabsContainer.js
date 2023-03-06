import ClassInstances from 'components/ClassInstances/ClassInstances';
import Tabs from 'components/Tabs/Tabs';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import InformationTab from './InformationTab';
import TreeView from './TreeView';

function TabsContainer({ id, label, uri, editMode }) {
    const { activeTab } = useParams();
    const [reloadTree, setReloadTree] = useState(false);
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
                activeKey={activeTab ?? 'tree'}
                items={[
                    {
                        label: 'Tree view',
                        key: 'tree',
                        children: (
                            <Row>
                                <Col md={6}>
                                    <TreeView id={id} label={label} reloadTree={reloadTree} />
                                </Col>
                                <Col md={6}>
                                    <InformationTab
                                        uri={uri}
                                        id={id}
                                        label={label}
                                        editMode={editMode}
                                        callBackToReloadTree={() => setReloadTree(v => !v)}
                                    />
                                </Col>
                            </Row>
                        ),
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
