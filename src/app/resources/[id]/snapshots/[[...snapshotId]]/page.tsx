'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import PublishHistoryModal from '@/app/resources/[id]/[[...activeTab]]/PublishHistoryModal/PublishHistoryModal';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { getSnapshot, resourcesUrl } from '@/services/backend/resources';
import { getTemplate, templatesUrl } from '@/services/backend/templates';

const PublishedResource = () => {
    const { id, snapshotId } = useParams();
    const [isOpenPublishHistoryModal, setIsOpenPublishHistoryModal] = useState(false);

    const {
        data: snapshot,
        isLoading,
        error,
    } = useSWR(id ? [{ id, snapshotId }, resourcesUrl, 'getSnapshots'] : null, ([params]) => getSnapshot(params));

    const { data: template } = useSWR(snapshot?.template_id ? [snapshot?.template_id, templatesUrl, 'getTemplate'] : null, ([params]) =>
        getTemplate(params),
    );

    const resource = snapshot?.data?.root;

    const snapshotStatements = snapshot
        ? Object.keys(snapshot?.data?.statements ?? [])
              .filter((predicateId) => snapshot?.data?.statements?.[predicateId]?.[0])
              .map((predicateId, index) => {
                  const data = snapshot?.data?.statements?.[predicateId]?.[0];

                  return {
                      id: index.toString(), // we don't have access to the id of the statement, so use the index instead
                      subject: snapshot?.data.root,
                      predicate: snapshot?.data?.predicates?.[predicateId],
                      object: data?.thing,
                      created_by: data?.created_by,
                      created_at: data?.created_at,
                  };
              })
              .filter(Boolean)
        : [];

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && resource && (
                <>
                    <TitleBar
                        buttonGroup={
                            <RequireAuthentication
                                size="sm"
                                component={Button}
                                color="secondary"
                                style={{ marginRight: 2 }}
                                tag={Link}
                                href={ROUTES.CREATE_RESOURCE}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-1" /> Create resource
                            </RequireAuthentication>
                        }
                    >
                        Published resource
                    </TitleBar>

                    <Alert color="warning" className="mt-1 container d-flex box-shadow" fade={false}>
                        <div className="flex-grow-1">
                            You are viewing the published version of the resource for the template <strong>{template?.label}</strong>.{' '}
                            <Link
                                href={reverse(ROUTES.RESOURCE, {
                                    id: resource.id,
                                })}
                            >
                                View the live data instead
                            </Link>{' '}
                            or{' '}
                            <Button color="link" className="p-0 border-0 align-baseline" onClick={() => setIsOpenPublishHistoryModal(true)}>
                                view publish history
                            </Button>
                            .
                        </div>
                    </Alert>

                    <Container className="box clearfix pt-4 pb-4 ps-4 pe-4 rounded">
                        <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                            {resource?.label || (
                                <i>
                                    <small>No label</small>
                                </i>
                            )}
                        </h3>

                        <ItemMetadata
                            item={resource}
                            handleUrl={snapshot.handle ? `http://handle.tib.eu/${snapshot.handle}` : undefined}
                            showCreatedAt
                            showCreatedBy
                            showProvenance
                            showExtractionMethod
                        />
                    </Container>

                    {snapshotStatements && snapshotStatements.length > 0 && (
                        <Container className="mt-3 p-0 box rounded">
                            <div className="p-4">
                                <DataBrowser isEditMode={false} id={id} valuesAsLinks propertiesAsLinks statementsSnapshot={snapshotStatements} />
                            </div>
                        </Container>
                    )}
                </>
            )}
            {isOpenPublishHistoryModal && resource && (
                <PublishHistoryModal toggle={() => setIsOpenPublishHistoryModal((v) => !v)} id={resource.id} snapshotId={snapshot.id} />
            )}
        </>
    );
};

export default PublishedResource;
