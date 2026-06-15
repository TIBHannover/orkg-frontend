'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@heroui/react';
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
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getSnapshot, resourcesUrl } from '@/services/backend/resources';
import { getTemplate, templatesUrl } from '@/services/backend/templates';

const SnapshotPage = ({ contentType, id, snapshotId }: { contentType: string; id: string; snapshotId: string }) => {
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
                      extraction_method: 'UNKNOWN' as const,
                      created_by: data?.created_by,
                      created_at: data?.created_at,
                  };
              })
              .filter(Boolean)
        : [];

    return (
        <>
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
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
                                href={contentType === 'Resource' ? ROUTES.CREATE_RESOURCE : `${reverse(ROUTES.CONTENT_TYPE_NEW)}?type=${contentType}`}
                            >
                                <FontAwesomeIcon icon={faPlus} className="mr-1" /> Create {contentType.toLowerCase()}
                            </RequireAuthentication>
                        }
                    >
                        Published {contentType.toLowerCase()}
                    </TitleBar>

                    <Container className="mt-1 mb-3">
                        <Alert status="warning" className="shadow-sm">
                            <Alert.Indicator />
                            <Alert.Content>
                                <Alert.Title>Viewing published {contentType.toLowerCase()}</Alert.Title>
                                <Alert.Description>
                                    This is a published snapshot for the template <strong>{template?.label}</strong>.{' '}
                                    <Link
                                        href={reverse(ROUTES.RESOURCE, {
                                            id: resource.id,
                                        })}
                                    >
                                        View the live data instead
                                    </Link>
                                    .
                                </Alert.Description>
                            </Alert.Content>
                            <Button color="secondary" size="sm" className="shrink-0" onClick={() => setIsOpenPublishHistoryModal(true)}>
                                Publish history
                            </Button>
                        </Alert>
                    </Container>

                    <Container>
                        <div className="box flow-root pt-6 pb-6 pl-6 pr-6 rounded">
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
                        </div>
                    </Container>

                    {snapshotStatements && snapshotStatements.length > 0 && (
                        <Container className="mt-4">
                            <div className="box rounded">
                                <div className="p-6">
                                    <DataBrowser
                                        isEditMode={false}
                                        id={id}
                                        valuesAsLinks
                                        propertiesAsLinks
                                        statementsSnapshot={snapshotStatements}
                                        snapshotCreatedAt={snapshot.created_at}
                                    />
                                </div>
                            </div>
                        </Container>
                    )}
                </>
            )}
            {isOpenPublishHistoryModal && resource && (
                <PublishHistoryModal
                    toggle={() => setIsOpenPublishHistoryModal((v) => !v)}
                    id={resource.id}
                    snapshotId={snapshot.id}
                    contentType={contentType}
                />
            )}
        </>
    );
};

export default SnapshotPage;
