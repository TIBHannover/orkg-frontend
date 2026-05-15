import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import useCountInstances from '@/components/Class/hooks/useCountInstances';
import ClassInstances from '@/components/ClassInstances/ClassInstances';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import Tabs from '@/components/Tabs/Tabs';
import Format from '@/components/Templates/Tabs/Format/Format';
import GeneralSettings from '@/components/Templates/Tabs/GeneralSettings/GeneralSettings';
import PropertyShapesTab from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShapesTab';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { RootStore } from '@/slices/types';

type TabsContainerProps = {
    id: string;
};

const TabsContainer: FC<TabsContainerProps> = ({ id }) => {
    const { activeTab } = useParams();
    const countPropertyShapes = useSelector((state: RootStore) => state.templateEditor.properties.length ?? 0);
    const targetClassId = useSelector((state: RootStore) => state.templateEditor.target_class?.id);
    const isSaving = useSelector((state: RootStore) => state.templateEditor.isSaving);
    const isLoading = useSelector((state: RootStore) => state.templateEditor.isLoading);
    const { isEditMode } = useIsEditMode();
    const router = useRouter();

    const { countInstances, isLoading: isLoadingCount } = useCountInstances(targetClassId);

    const onTabChange = (key: string) => {
        router.push(
            `${reverse(ROUTES.TEMPLATE_TABS, {
                id,
                activeTab: key,
            })}?isEditMode=${isEditMode}`,
        );
    };

    return (
        <Container className="mt-4 relative">
            <LoadingOverlay
                isLoading={isLoading || isSaving}
                className="rounded"
                loadingText={
                    <>
                        {!isSaving && isLoading && <h1 className="text-2xl">Loading</h1>}
                        {isSaving && (
                            <div>
                                <h1 className="text-2xl">Saving...</h1>
                                Please <strong>do not</strong> leave this page until the save process is finished.
                            </div>
                        )}
                    </>
                }
            />
            <Tabs
                className="box rounded"
                destroyOnHidden={false}
                onChange={onTabChange}
                activeKey={activeTab ?? 'description'}
                items={[
                    {
                        label: 'Description',
                        key: 'description',
                        children: (
                            <div className="px-6 py-4">
                                <GeneralSettings />
                            </div>
                        ),
                    },
                    {
                        label: (
                            <span className="inline-flex items-center gap-2">
                                Properties
                                <Chip size="sm" variant="soft">
                                    {countPropertyShapes}
                                </Chip>
                            </span>
                        ),
                        key: 'properties',
                        children: (
                            <div className="px-6 py-4">
                                <PropertyShapesTab />
                            </div>
                        ),
                    },
                    {
                        label: 'Format',
                        key: 'format',
                        children: (
                            <div className="px-6 py-4">
                                <Format />
                            </div>
                        ),
                    },
                    ...(targetClassId
                        ? [
                              {
                                  label: (
                                      <span className="inline-flex items-center gap-2">
                                          Instances
                                          {isLoadingCount ? (
                                              <FontAwesomeIcon icon={faSpinner} spin />
                                          ) : (
                                              <Chip size="sm" variant="soft">
                                                  {countInstances}
                                              </Chip>
                                          )}
                                      </span>
                                  ),
                                  key: 'instances',
                                  children: (
                                      <div className="px-6 py-4">
                                          <ClassInstances classId={targetClassId} title="template" />
                                      </div>
                                  ),
                              },
                          ]
                        : []),
                ]}
            />
        </Container>
    );
};

export default TabsContainer;
