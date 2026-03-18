'use client';

import { reverse } from 'named-urls';
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
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
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
        setPreventEditCase(prevent);
    }, [resource]);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
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
                        <Alert color="warning" className="mt-1 container d-flex box-shadow" fade={false}>
                            <div className="flex-grow-1">
                                A published version of this {contentType.toLowerCase()} is available.{' '}
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
                                </Link>{' '}
                                or{' '}
                                <Button color="link" className="p-0 border-0 align-baseline" onClick={() => setIsOpenPublishHistoryModal(true)}>
                                    view publish history
                                </Button>
                                .
                            </div>
                        </Alert>
                    )}

                    {isEditMode && preventEditCase?.warningOnEdit && preventEditCase.warningOnEdit}
                    <EditModeHeader isVisible={isEditMode} />
                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
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
