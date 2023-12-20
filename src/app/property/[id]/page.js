'use client';

import { faPen, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import EditableHeader from 'components/EditableHeader';
import PropertyStatements from 'components/Property/PropertyStatements/PropertyStatements';
import useDeleteProperty from 'components/Property/hooks/useDeleteProperty';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ItemMetadata from 'components/Search/ItemMetadata';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import TitleBar from 'components/TitleBar/TitleBar';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { ENTITIES } from 'constants/graphSettings';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useParams from 'components/NextJsMigration/useParams';
import { Button, Container } from 'reactstrap';
import { getPredicate } from 'services/backend/predicates';

function Property() {
    const [error, setError] = useState(null);
    const [property, setProperty] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const params = useParams();
    const propertyId = params.id;
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    const { deleteProperty } = useDeleteProperty({ propertyId, redirect: true });

    useEffect(() => {
        const findPredicate = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getPredicate(propertyId);
                document.title = `${responseJson.label} - Property - ORKG`;

                setProperty(responseJson);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setProperty(null);
                setError(err);
                setIsLoading(false);
            }
        };
        findPredicate();
    }, [propertyId]);

    const handleHeaderChange = value => {
        setProperty(prev => ({ ...prev, label: value }));
    };

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
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
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button className="float-end flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                    <Icon icon={faTimes} /> Stop editing
                                </Button>
                            )
                        }
                    >
                        Property
                    </TitleBar>
                    <Container className="p-0 clearfix">
                        <EditModeHeader isVisible={isEditMode} />
                        <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
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
                                        id={params.id}
                                        value={property?.label}
                                        onChange={handleHeaderChange}
                                        entityType={ENTITIES.PREDICATE}
                                        curatorsOnly={true}
                                    />
                                    {isEditMode && isCurationAllowed && (
                                        <Button
                                            color="danger"
                                            size="sm"
                                            className="mt-2 mb-3"
                                            style={{ marginLeft: 'auto' }}
                                            onClick={deleteProperty}
                                        >
                                            <Icon icon={faTrash} /> Delete property
                                        </Button>
                                    )}
                                </>
                            )}
                            <ItemMetadata item={property} showCreatedAt={true} showCreatedBy={true} />
                            <hr />
                            <h3 className="h5">Statements</h3>
                            <div className="clearfix">
                                <StatementBrowser
                                    rootNodeType={ENTITIES.PREDICATE}
                                    enableEdit={isEditMode}
                                    syncBackend={isEditMode}
                                    openExistingResourcesInDialog={false}
                                    initialSubjectId={propertyId}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
                                    keyToKeepStateOnLocationChange={propertyId}
                                />
                            </div>
                            <PropertyStatements propertyId={propertyId} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
}

export default Property;
