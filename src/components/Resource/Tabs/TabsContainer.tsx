import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { FC } from 'react';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import ObjectStatements from '@/components/Resource/Tabs/ObjectStatements';
import PreviewFactory from '@/components/Resource/Tabs/Preview/PreviewFactory/PreviewFactory';
import ResourceUsage from '@/components/Resource/Tabs/ResourceUsage';
import Tabs from '@/components/Tabs/Tabs';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

type TabsContainerProps = {
    id: string;
    classes: string[];
    editMode: boolean;
};

const TabsContainer: FC<TabsContainerProps> = ({ id, classes, editMode }) => {
    const { activeTab } = useParams();

    const router = useRouter();

    const onTabChange = (key: string) => {
        router.push(
            `${reverse(ROUTES.RESOURCE_TABS, {
                id,
                activeTab: key,
            })}?noRedirect&isEditMode=${editMode}`,
        );
    };

    return (
        <Container className="mt-3 p-0">
            <Tabs
                className="box rounded"
                destroyOnHidden
                onChange={onTabChange}
                activeKey={activeTab ?? 'information'}
                items={[
                    {
                        label: 'Resource information',
                        key: 'information',
                        children: (
                            <div className="p-4">
                                <DataBrowser isEditMode={editMode} id={id} valuesAsLinks propertiesAsLinks canEditSharedRootLevel />
                            </div>
                        ),
                    },
                    ...(classes?.includes(CLASSES.VISUALIZATION) || classes?.includes(CLASSES.CSVW_TABLE)
                        ? [
                              {
                                  label: 'Preview',
                                  key: 'preview',
                                  children: <PreviewFactory id={id} classes={classes} />,
                              },
                          ]
                        : []),
                    /*
                        {
                            label: 'Trend',
                            key: 'trend',
                            children: <Trend id={id} />,
                        }, */
                    {
                        label: 'In papers',
                        key: 'papers',
                        children: <ResourceUsage id={id} />,
                    },

                    {
                        label: 'In statements',
                        key: 'statements',
                        children: <ObjectStatements id={id} />,
                    },
                ]}
            />
        </Container>
    );
};

export default TabsContainer;
