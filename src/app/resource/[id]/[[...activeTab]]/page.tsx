'use client';

import { faEllipsisV, faExternalLinkAlt, faPen, faPlus, faTimes, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Container, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import PublishHistoryModal from '@/app/resources/[id]/[[...activeTab]]/PublishHistoryModal/PublishHistoryModal';
import PublishResourceModal from '@/app/resources/[id]/[[...activeTab]]/PublishResourceModal/PublishResourceModal';
import EditableHeader from '@/components/EditableHeader';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import useAuthentication from '@/components/hooks/useAuthentication';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import useMarkFeaturedUnlisted from '@/components/MarkFeaturedUnlisted/hooks/useMarkFeaturedUnlisted';
import MarkFeatured from '@/components/MarkFeaturedUnlisted/MarkFeatured/MarkFeatured';
import MarkUnlisted from '@/components/MarkFeaturedUnlisted/MarkUnlisted/MarkUnlisted';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import getPreventEditCase, { PreventEditCase } from '@/components/Resource/hooks/preventEditing';
import DEDICATED_PAGE_LINKS from '@/components/Resource/hooks/redirectionSettings';
import useDeleteResource from '@/components/Resource/hooks/useDeleteResource';
import PreventModal from '@/components/Resource/PreventModal/PreventModal';
import TabsContainer from '@/components/Resource/Tabs/TabsContainer';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import CONTENT_TYPES from '@/constants/contentTypes';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getResource, getSnapshots, resourcesUrl } from '@/services/backend/resources';
import { reverseWithSlug } from '@/utils';

function Resource() {
    const { id } = useParams();

    const [isOpenPublishModal, setIsOpenPublishModal] = useState(false);
    const [isOpenPublishHistoryModal, setIsOpenPublishHistoryModal] = useState(false);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const [isOpenGraphViewModal, setIsOpenGraphViewModal] = useState(false);
    const [preventEditCase, setPreventEditCase] = useState<PreventEditCase | null>(null);
    const [isOpenPreventModal, setIsOpenPreventModal] = useState(false);

    const { user } = useAuthentication();
    const { deleteResource } = useDeleteResource({ resourceId: id, redirect: true });
    const router = useRouter();
    const searchParams = useSearchParams();
    const noRedirect = searchParams.get('noRedirect');

    const { data: snapshots } = useSWR(id ? [id, resourcesUrl, 'getSnapshots'] : null, ([resourceId]) =>
        getSnapshots({
            id: resourceId,
        }),
    );

    const { data: resource, isLoading, error, mutate } = useSWR(id ? [id, resourcesUrl, 'getResource'] : null, ([params]) => getResource(params));

    const { isFeatured, isUnlisted, handleChangeStatus } = useMarkFeaturedUnlisted({
        resourceId: id,
        unlisted: resource?.unlisted ?? false,
        featured: resource?.featured ?? false,
    });

    const isShared = resource && resource?.shared > 0;
    const isUserIsCreator = resource?.created_by === user?.id;
    const isCurationAllowed =
        user && (user.isCurationAllowed || (user.id === resource?.created_by && resource?.classes?.includes(CLASSES.COMPARISON)));
    const isDeletionAllowed = !isShared && (isUserIsCreator || isCurationAllowed);

    const getDedicatedLink = useCallback((classes?: string[]) => {
        for (const _class of classes ?? []) {
            if (_class in DEDICATED_PAGE_LINKS) {
                // only for a link for the first class occurrence (to prevent problems when a
                // resource has multiple classes form the list), so return
                return DEDICATED_PAGE_LINKS[_class];
            }
        }
        return null;
    }, []);

    useEffect(() => {
        if (!resource) {
            return;
        }

        document.title = `${resource?.label || 'Resource'} - ORKG`;
        const link = getDedicatedLink(resource.classes);
        if (noRedirect === null && link) {
            router.replace(
                reverseWithSlug(link.route, {
                    [link.routeParams]: id,
                    slug: link.hasSlug ? resource.label : undefined,
                }),
            );
        }
        const prevent = getPreventEditCase(resource);
        setPreventEditCase(prevent);
    }, [getDedicatedLink, id, noRedirect, resource, router]);

    const handleHeaderChange = () => {
        mutate();
    };

    const dedicatedLink = getDedicatedLink(resource?.classes);
    const preventDeletionTooltipText = isShared
        ? 'This resource is used in statements so it cannot be deleted'
        : "You cannot delete this resource because you are not the creator and you don't have the curator role";

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && resource && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {isEditMode ? (
                                    <RequireAuthentication
                                        size="sm"
                                        component={Button}
                                        color="secondary"
                                        style={{ marginRight: 2 }}
                                        onClick={() => setIsOpenPublishModal(true)}
                                    >
                                        <FontAwesomeIcon icon={faUpload} className="me-1" /> Publish
                                    </RequireAuthentication>
                                ) : (
                                    <RequireAuthentication
                                        size="sm"
                                        component={Button}
                                        color="secondary"
                                        style={{ marginRight: 2 }}
                                        tag={Link}
                                        href={ROUTES.ADD_RESOURCE}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-1" /> Create resource
                                    </RequireAuthentication>
                                )}
                                {dedicatedLink && (
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        tag={Link}
                                        href={reverseWithSlug(dedicatedLink.route, {
                                            [dedicatedLink.routeParams]: id,
                                            slug: dedicatedLink.hasSlug ? resource?.label : undefined,
                                        })}
                                        style={{ marginRight: 2 }}
                                    >
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" /> {dedicatedLink.label} view
                                    </Button>
                                )}
                                {!isEditMode && (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => (!isCurationAllowed && preventEditCase ? setIsOpenPreventModal(true) : toggleIsEditMode())}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                {isEditMode && (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                                <UncontrolledButtonDropdown>
                                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end" style={{ marginLeft: 2 }}>
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </DropdownToggle>
                                    <DropdownMenu end="true">
                                        <DropdownItem onClick={() => setIsOpenGraphViewModal(true)}>View graph</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </>
                        }
                    >
                        Resource
                    </TitleBar>

                    {snapshots?.content?.[0] && (
                        <Alert color="warning" className="mt-1 container d-flex box-shadow" fade={false}>
                            <div className="flex-grow-1">
                                A published version of this resource is available.{' '}
                                <Link
                                    href={reverse(ROUTES.RESOURCE_SNAPSHOT, {
                                        id: snapshots?.content?.[0].resource_id,
                                        snapshotId: snapshots?.content?.[0].id,
                                    })}
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
                        {!isEditMode ? (
                            <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {resource?.label || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}
                                {resource?.classes?.some((c) => CONTENT_TYPES.includes(c)) && (
                                    <span className="ms-2">
                                        <MarkFeatured size="xs" featured={isFeatured} handleChangeStatus={handleChangeStatus} />
                                        <div className="d-inline-block ms-1">
                                            <MarkUnlisted size="xs" unlisted={isUnlisted} handleChangeStatus={handleChangeStatus} />
                                        </div>
                                    </span>
                                )}
                            </h3>
                        ) : (
                            <>
                                <EditableHeader id={id} value={resource?.label ?? ''} onChange={handleHeaderChange} entityType={ENTITIES.RESOURCE} />

                                <Tooltip content={preventDeletionTooltipText} disabled={isDeletionAllowed ?? false}>
                                    <span>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="mt-2 mb-3"
                                            style={{ marginLeft: 'auto' }}
                                            onClick={deleteResource}
                                            disabled={!isDeletionAllowed}
                                        >
                                            <FontAwesomeIcon icon={faTrash} /> Delete resource
                                        </Button>
                                    </span>
                                </Tooltip>
                            </>
                        )}

                        <ItemMetadata item={resource} showCreatedAt showCreatedBy showProvenance showExtractionMethod editMode={isEditMode} />
                    </Container>
                    <TabsContainer classes={resource.classes} id={id} editMode={isEditMode} />

                    {preventEditCase && (
                        <PreventModal
                            {...preventEditCase.preventModalProps(resource)}
                            isOpen={isOpenPreventModal}
                            toggle={() => setIsOpenPreventModal((v) => !v)}
                        />
                    )}
                    {isOpenGraphViewModal && <GraphViewModal toggle={() => setIsOpenGraphViewModal((v) => !v)} resourceId={resource.id} />}
                    {isOpenPublishModal && <PublishResourceModal toggle={() => setIsOpenPublishModal((v) => !v)} resource={resource} />}
                    {isOpenPublishHistoryModal && <PublishHistoryModal toggle={() => setIsOpenPublishHistoryModal((v) => !v)} id={resource?.id} />}
                </>
            )}
        </>
    );
}

export default Resource;
