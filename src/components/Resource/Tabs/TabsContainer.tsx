'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';

import { additionalContentTypes } from '@/components/ContentType/types';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import ObjectStatements from '@/components/Resource/Tabs/ObjectStatements';
import PreviewFactory from '@/components/Resource/Tabs/Preview/PreviewFactory/PreviewFactory';
import ResourceUsage from '@/components/Resource/Tabs/ResourceUsage';
import TabLabel from '@/components/Resource/Tabs/TabLabel';
import Tabs from '@/components/Tabs/Tabs';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Resource } from '@/services/backend/types';

type TabsContainerProps = {
    id: string;
    resource?: Resource;
    editMode: boolean;
    contentType: string;
};

const TabsContainer: FC<TabsContainerProps> = ({ id, resource, editMode, contentType }) => {
    const { activeTab } = useParams();

    const router = useRouter();

    const onTabChange = (key: string) => {
        if (additionalContentTypes.find((c) => c.id === contentType)) {
            router.push(
                `${reverse(ROUTES.CONTENT_TYPE_TABS, {
                    type: contentType,
                    id,
                    activeTab: key,
                })}?isEditMode=${editMode}`,
            );
        } else {
            router.push(
                `${reverse(ROUTES.RESOURCE_TABS, {
                    id,
                    activeTab: key,
                })}?noRedirect&isEditMode=${editMode}`,
            );
        }
    };

    const defaultTab = resource?.classes?.includes(CLASSES.CSVW_TABLE) ? 'preview' : 'information';

    return (
        <Container className="mt-4">
            <Tabs
                className="box rounded"
                destroyOnHidden
                onChange={onTabChange}
                activeKey={activeTab ?? defaultTab}
                items={[
                    {
                        label: <TabLabel tabKey="information" id={id} label={`${contentType} information`} />,
                        key: 'information',
                        children: (
                            <div className="p-6">
                                <DataBrowser isEditMode={editMode} id={id} valuesAsLinks propertiesAsLinks canEditSharedRootLevel />
                            </div>
                        ),
                    },
                    ...(resource?.classes?.includes(CLASSES.VISUALIZATION) || resource?.classes?.includes(CLASSES.CSVW_TABLE)
                        ? [
                              {
                                  label: 'Preview',
                                  key: 'preview',
                                  children: <PreviewFactory id={id} classes={resource?.classes} />,
                              },
                          ]
                        : []),
                    {
                        label: <TabLabel id={id} label="In papers" tabKey="papers" />,
                        key: 'papers',
                        children: <ResourceUsage id={id} />,
                    },

                    {
                        label: <TabLabel id={id} label="Incoming statements" tabKey="statements" statsValue={resource?.shared} />,
                        key: 'statements',
                        children: <ObjectStatements id={id} contentType={contentType} />,
                    },
                ]}
            />
        </Container>
    );
};

export default TabsContainer;
