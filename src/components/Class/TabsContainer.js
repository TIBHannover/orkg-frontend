import InformationTab from 'components/Class/InformationTab';
import TreeView from 'components/Class/TreeView';
import ClassInstances from 'components/ClassInstances/ClassInstances';
import Tabs from 'components/Tabs/Tabs';
import { TabHeaderStyle } from 'components/Tabs/styled';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import useRouter from 'components/NextJsMigration/useRouter';
import useParams from 'components/NextJsMigration/useParams';
import { Col, Container, Row } from 'reactstrap';

function TabsContainer({ id, label, classObject, editMode }) {
    const { activeTab } = useParams();
    const [reloadTree, setReloadTree] = useState(false);
    const router = useRouter();

    const onTabChange = (key) => {
        router.push(
            `${reverse(ROUTES.CLASS_TABS, {
                id,
                activeTab: key,
            })}?noRedirect&isEditMode=${editMode}`,
        );
    };

    return (
        <Container className="mt-3 p-1">
            <Row className="ps-2">
                <Col md={6} className="box rounded" style={{ background: '#fff' }}>
                    <TabHeaderStyle className="rc-tabs-nav-wrap">Tree view</TabHeaderStyle>
                    <TreeView id={id} label={label} reloadTree={reloadTree} />
                </Col>
                <Col md={6}>
                    <Tabs
                        className="box rounded"
                        style={{ position: 'sticky', top: '70px' }}
                        destroyInactiveTabPane
                        onChange={onTabChange}
                        activeKey={activeTab ?? 'information'}
                        items={[
                            {
                                label: 'Class information',
                                key: 'information',
                                children: (
                                    <InformationTab
                                        classObject={classObject}
                                        id={id}
                                        label={label}
                                        editMode={editMode}
                                        callBackToReloadTree={() => setReloadTree((v) => !v)}
                                    />
                                ),
                            },
                            {
                                label: 'Instances',
                                key: 'instances',
                                children: <ClassInstances classId={id} />,
                            },
                        ]}
                    />
                </Col>
            </Row>
        </Container>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    classObject: PropTypes.object,
    editMode: PropTypes.bool.isRequired,
};

export default TabsContainer;
