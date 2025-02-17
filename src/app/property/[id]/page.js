'use client';

import { faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import EditableHeader from 'components/EditableHeader';
import PropertyStatements from 'components/Property/PropertyStatements/PropertyStatements';
import useDeleteProperty from 'components/Property/hooks/useDeleteProperty';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ItemMetadata from 'components/Search/ItemMetadata';
import TitleBar from 'components/TitleBar/TitleBar';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import useAuthentication from 'components/hooks/useAuthentication';
import useParams from 'components/useParams/useParams';
import { ENTITIES } from 'constants/graphSettings';
import { Button, Container } from 'reactstrap';
import { getPredicate, predicatesUrl } from 'services/backend/predicates';
import useSWR from 'swr';

function Property() {
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { id: propertyId } = useParams();
    const { user, isCurationAllowed } = useAuthentication();

    const { deleteProperty } = useDeleteProperty({ propertyId, redirect: true });

    const fetcher = async (id) => {
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

    const handleHeaderChange = (value) => {
        mutate();
    };

    const isUserIsCreator = property?.created_by === user?.id;
    const isDeletionAllowed = isUserIsCreator || isCurationAllowed;

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />}</>}
            {!isLoading && !error && (
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
                                    value={property?.label}
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
                    <Container className="mt-3 p-1 box rounded">
                        <div className="pt-4 ps-4 pb-4 pe-4">
                            <DataBrowser isEditMode={isEditMode} id={propertyId} propertiesAsLinks valuesAsLinks />

                            <PropertyStatements propertyId={propertyId} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
}

export default Property;
