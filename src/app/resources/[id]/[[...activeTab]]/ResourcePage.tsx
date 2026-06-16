'use client';

import { Alert } from '@heroui/react';
import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import Label from '@/app/resources/[id]/[[...activeTab]]/Label';
import PublishHistoryModal from '@/app/resources/[id]/[[...activeTab]]/PublishHistoryModal/PublishHistoryModal';
import PublishResourceModal from '@/app/resources/[id]/[[...activeTab]]/PublishResourceModal/PublishResourceModal';
import TitleBarButtons from '@/app/resources/[id]/[[...activeTab]]/TitleBarButtons';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import getPreventEditCase, { PreventEditCase } from '@/components/Resource/hooks/preventEditing';
import PreventModal from '@/components/Resource/PreventModal/PreventModal';
import TabsContainer from '@/components/Resource/Tabs/TabsContainer';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResource, getSnapshots, resourcesUrl } from '@/services/backend/resources';

type ResourcePageProps = {
    contentType: string;
    id: string;
};

const ResourcePage: FC<ResourcePageProps> = ({ contentType, id }) => {
    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenPublishHistoryModal, setIsOpenPublishHistoryModal] = useState(false);
    const { isEditMode } = useIsEditMode();
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [preventEditCase, setPreventEditCase] = useState<PreventEditCase | undefined>(undefined);
    const [isOpenPreventModal, setIsOpenPreventModal] = useState(false);

    const { user } = useAuthentication();

    const { data: snapshots } = useSWR(id ? [id, resourcesUrl, 'getSnapshots'] : null, ([resourceId]) =>
        getSnapshots({
            id: resourceId,
        }),
    );

    const { data: resource, isLoading, error, mutate } = useSWR(id ? [id, resourcesUrl, 'getResource'] : null, ([params]) => getResource(params));

    const isShared = !!(resource && resource?.shared > 0);
    const isUserIsCreator = resource?.created_by === user?.id;
    const isCurationAllowed = !!(
        user &&
        (user.isCurationAllowed || (user.id === resource?.created_by && resource?.classes?.includes(CLASSES.COMPARISON)))
    );
    const isDeletionAllowed = !isShared && (isUserIsCreator || isCurationAllowed);

    useEffect(() => {
        if (!resource) {
            return;
        }
        const prevent = getPreventEditCase(resource);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPreventEditCase(prevent);
    }, [resource]);

    return (
        <>
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && resource && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <TitleBarButtons
                                resource={resource}
                                contentType={contentType}
                                isCurationAllowed={!!isCurationAllowed}
                                preventEditCase={preventEditCase}
                                setIsOpenPublishModal={setIsOpenPublishModal}
                                setIsOpenPreventModal={setIsOpenPreventModal}
                                setIsOpenGraphViewModal={setIsOpenGraphViewModal}
                            />
                        }
                    >
                        {contentType}
                    </TitleBar>

                    {snapshots?.content?.[0] && (
                        <Container className="mt-1 mb-3">
                            <Alert status="warning" className="shadow">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Published version available</Alert.Title>
                                    <Alert.Description>
                                        A published version of this {contentType.toLowerCase()} is available. You are currently viewing the live data.{' '}
                                        <Link
                                            href={
                                                contentType === 'Resource'
                                                    ? reverse(ROUTES.RESOURCE_SNAPSHOT, {
                                                          id: snapshots?.content?.[0].resource_id,
                                                          snapshotId: snapshots?.content?.[0].id,
                                                      })
                                                    : `${reverse(ROUTES.CONTENT_TYPE_SNAPSHOT, {
                                                          type: contentType,
                                                          id,
                                                          snapshotId: snapshots?.content?.[0].id,
                                                      })}`
                                            }
                                        >
                                            View the latest published version
                                        </Link>
                                        .
                                    </Alert.Description>
                                </Alert.Content>
                                <Button color="secondary" size="sm" className="shrink-0" onClick={() => setIsOpenPublishHistoryModal(true)}>
                                    Publish history
                                </Button>
                            </Alert>
                        </Container>
                    )}

                    {isEditMode && preventEditCase?.warningOnEdit && preventEditCase.warningOnEdit}
                    <EditModeHeader isVisible={isEditMode} />
                    <Container>
                        <div className={`box flow-root pt-6 pb-6 pl-6 pr-6 ${isEditMode ? 'rounded-b' : 'rounded'}`}>
                            <Label id={id} resource={resource} isShared={isShared} mutate={mutate} isDeletionAllowed={isDeletionAllowed} />

                            <ItemMetadata
                                item={resource}
                                showCreatedAt
                                showCreatedBy
                                showProvenance
                                showExtractionMethod
                                editMode={isEditMode}
                                updateCallBack={() => mutate()}
                            />
                        </div>
                    </Container>
                    <TabsContainer resource={resource} id={id} editMode={isEditMode} contentType={contentType} />

                    {preventEditCase && (
                        <PreventModal
                            {...preventEditCase.preventModalProps(resource)}
                            isOpen={isOpenPreventModal}
                            toggle={() => setIsOpenPreventModal((v) => !v)}
                        />
                    )}
                    {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={resource.id} />}
                    {isOpenPublishModal && <PublishResourceModal toggle={() => setIsOpenPublishModal((v) => !v)} resource={resource} />}
                    {isOpenPublishHistoryModal && (
                        <PublishHistoryModal toggle={() => setIsOpenPublishHistoryModal((v) => !v)} id={resource?.id} contentType={contentType} />
                    )}
                </>
            )}
        </>
    );
};

export default ResourcePage;
