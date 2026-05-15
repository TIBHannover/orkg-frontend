import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';

import InformationTab from '@/components/Class/InformationTab';
import TreeView from '@/components/Class/TreeView';
import ClassInstances from '@/components/ClassInstances/ClassInstances';
import Tabs from '@/components/Tabs/Tabs';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Class } from '@/services/backend/types';

type TabsContainerProps = {
    id: string;
    label: string;
    classObject: Class;
    editMode: boolean;
};

const TabsContainer: FC<TabsContainerProps> = ({ id, classObject, editMode }) => {
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
        <Container className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="box rounded bg-surface">
                    <div className="px-4 py-3 text-base font-medium border-b-2 border-separator">Tree view</div>
                    <TreeView id={id} reloadTree={reloadTree} />
                </div>
                <div>
                    <Tabs
                        className="box rounded bg-surface sticky top-[70px]"
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
                </div>
            </div>
        </Container>
    );
};

export default TabsContainer;
