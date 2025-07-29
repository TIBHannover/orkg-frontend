'use client';

import { faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { Container } from 'reactstrap';
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
import Tabs from '@/components/Tabs/Tabs';
import TitleBar from '@/components/TitleBar/TitleBar';
import Button from '@/components/Ui/Button/Button';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
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
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && !error && property && (
                <>
                    <TitleBar
                        buttonGroup={
                            !isEditMode ? (
                                <RequireAuthentication
                                    component={Button}
                                    className="float-end flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => toggleIsEditMode()}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button className="float-end flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                                </Button>
                            )
                        }
                    >
                        Property
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container className={`box pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        {!isEditMode ? (
                            <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {property?.label || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}
                            </h3>
                        ) : (
                            <>
                                <EditableHeader
                                    id={propertyId}
                                    value={property?.label || ''}
                                    onChange={handleHeaderChange}
                                    entityType={ENTITIES.PREDICATE}
                                    curatorsOnly
                                />
                                {isDeletionAllowed && (
                                    <Button color="danger" size="sm" className="mt-2 mb-3" style={{ marginLeft: 'auto' }} onClick={deleteProperty}>
                                        <FontAwesomeIcon icon={faTrash} /> Delete property
                                    </Button>
                                )}
                            </>
                        )}
                        <ItemMetadata item={property} showCreatedAt showCreatedBy />
                    </Container>

                    <Container className="mt-3 p-0">
                        <Tabs
                            className="box rounded"
                            destroyOnHidden
                            onChange={onTabChange}
                            activeKey={activeTab ?? 'information'}
                            items={[
                                {
                                    label: 'Property information',
                                    key: 'information',
                                    children: (
                                        <div className="p-4">
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
                                    label: 'In statements',
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
