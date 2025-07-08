import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

import InformationTab from '@/components/Class/InformationTab';
import TreeView from '@/components/Class/TreeView';
import ClassInstances from '@/components/ClassInstances/ClassInstances';
import { TabHeaderStyle } from '@/components/Tabs/styled';
import Tabs from '@/components/Tabs/Tabs';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { Class } from '@/services/backend/types';

type TabsContainerProps = {
    id: string;
    label: string;
    classObject: Class;
    editMode: boolean;
};

const TabsContainer: FC<TabsContainerProps> = ({ id, label, classObject, editMode }) => {
    const { activeTab } = useParams();
    const [reloadTree, setReloadTree] = useState(false);
    const router = useRouter();

    const onTabChange = (key: string) => {
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
                        destroyOnHidden
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
};

export default TabsContainer;
