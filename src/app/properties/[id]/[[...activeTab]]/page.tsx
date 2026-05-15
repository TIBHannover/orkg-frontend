'use client';

import { faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import EditableHeader from '@/components/EditableHeader';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import useAuthentication from '@/components/hooks/useAuthentication';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import useDeleteProperty from '@/components/Property/hooks/useDeleteProperty';
import PropertyStatements from '@/components/Property/PropertyStatements/PropertyStatements';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TabLabel from '@/components/Tabs/TabLabel';
import Tabs from '@/components/Tabs/Tabs';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getPredicate, predicatesUrl } from '@/services/backend/predicates';

const Property = () => {
    const { id: propertyId, activeTab } = useParams();
    const router = useRouter();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const { user, isCurationAllowed } = useAuthentication();

    const { deleteProperty } = useDeleteProperty({ propertyId, redirect: true });

    const onTabChange = (key: string) => {
        router.push(
            `${reverse(ROUTES.PROPERTY_TABS, {
                id: propertyId,
                activeTab: key,
            })}?isEditMode=${isEditMode}`,
        );
    };

    const fetcher = async (id: string) => {
        const response = await getPredicate(id);
        document.title = `${response.label} - Property - ORKG`;
        return response;
    };

    const {
        data: property,
        error,
        isLoading,
        mutate,
    } = useSWR(propertyId ? [propertyId, predicatesUrl, 'getPredicate'] : null, ([params]) => fetcher(params));

    const handleHeaderChange = (value: string) => {
        mutate();
    };

    const isUserIsCreator = property?.created_by === user?.id;
    const isDeletionAllowed = isUserIsCreator || isCurationAllowed;

    return (
        <>
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && !error && property && (
                <>
                    <TitleBar
                        buttonGroup={
                            !isEditMode ? (
                                <RequireAuthentication
                                    component={Button}
                                    className="button--orkg-secondary"
                                    size="sm"
                                    onPress={() => toggleIsEditMode()}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button className="button--orkg-secondary-darker" size="sm" onPress={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            )
                        }
                    >
                        Property
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container>
                        <div className={`box flow-root pt-6 pb-6 pl-6 pr-6 ${isEditMode ? 'rounded-b' : 'rounded'}`}>
                            <div className="mb-6">
                                {!isEditMode ? (
                                    <h2 className="text-2xl font-semibold mb-0 flex flex-wrap items-center gap-2 break-words">
                                        <span className="break-words">
                                            {property?.label || (
                                                <i>
                                                    <small>No label</small>
                                                </i>
                                            )}
                                        </span>
                                    </h2>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <EditableHeader
                                            id={propertyId}
                                            value={property?.label || ''}
                                            onChange={handleHeaderChange}
                                            entityType={ENTITIES.PREDICATE}
                                            curatorsOnly
                                        />
                                        {isDeletionAllowed && (
                                            <div className="flex justify-end">
                                                <Button variant="danger" size="sm" onPress={deleteProperty}>
                                                    <FontAwesomeIcon icon={faTrash} /> Delete property
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <ItemMetadata item={property} showCreatedAt showCreatedBy />
                        </div>
                    </Container>

                    <Container className="mt-4">
                        <Tabs
                            className="box rounded"
                            destroyOnHidden
                            onChange={onTabChange}
                            activeKey={activeTab ?? 'information'}
                            items={[
                                {
                                    label: (
                                        <TabLabel
                                            group="things"
                                            classId="statement-count"
                                            label="Property information"
                                            countParams={{ subject_id: propertyId }}
                                            showCount
                                        />
                                    ),
                                    key: 'information',
                                    children: (
                                        <div className="p-6">
                                            <DataBrowser
                                                isEditMode={isEditMode}
                                                id={propertyId}
                                                valuesAsLinks
                                                propertiesAsLinks
                                                canEditSharedRootLevel
                                            />
                                        </div>
                                    ),
                                },
                                {
                                    label: (
                                        <TabLabel
                                            group="things"
                                            classId="statement-count"
                                            label="In statements"
                                            countParams={{ predicate_id: propertyId }}
                                            showCount
                                        />
                                    ),
                                    key: 'statements',
                                    children: <PropertyStatements id={propertyId} />,
                                },
                            ]}
                        />
                    </Container>
                </>
            )}
        </>
    );
};

export default Property;
