import { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { getPredicate } from 'services/backend/predicates';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import InternalServerError from 'pages/InternalServerError';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useParams } from 'react-router-dom';
import PropertyStatements from 'components/PropertyStatements/PropertyStatements';
import { ENTITIES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';
import ItemMetadata from 'components/Search/ItemMetadata';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import EditableHeader from 'components/EditableHeader';

function Property() {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [property, setProperty] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const params = useParams();
    const propertyId = params.id;

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
    }, [location, propertyId]);

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
                            !editMode ? (
                                <RequireAuthentication
                                    component={Button}
                                    className="float-end flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => setEditMode(v => !v)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button className="float-end flex-shrink-0" color="secondary-darker" size="sm" onClick={() => setEditMode(v => !v)}>
                                    <Icon icon={faTimes} /> Stop editing
                                </Button>
                            )
                        }
                    >
                        Property view
                    </TitleBar>
                    <Container className="p-0 clearfix">
                        <EditModeHeader isVisible={editMode} />
                        <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                            {!editMode ? (
                                <h3 style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    {property?.label || (
                                        <i>
                                            <small>No label</small>
                                        </i>
                                    )}
                                </h3>
                            ) : (
                                <EditableHeader
                                    id={params.id}
                                    value={property?.label}
                                    onChange={handleHeaderChange}
                                    entityType={ENTITIES.PREDICATE}
                                    curatorsOnly={true}
                                />
                            )}
                            <ItemMetadata item={property} showCreatedAt={true} showCreatedBy={true} />
                            <hr />
                            <h3 className="h5">Statements</h3>
                            <div className="clearfix">
                                <StatementBrowser
                                    rootNodeType={ENTITIES.PREDICATE}
                                    enableEdit={editMode}
                                    syncBackend={editMode}
                                    openExistingResourcesInDialog={false}
                                    initialSubjectId={propertyId}
                                    initialSubjectLabel={property?.label}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
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
