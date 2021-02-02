import { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { getPredicate } from 'services/backend/predicates';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import InternalServerError from 'pages/InternalServerError';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { EditModeHeader, Title } from 'pages/ViewPaper';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import PropertyStatements from 'components/PropertyStatements/PropertyStatements';

function Property(props) {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const findPredicate = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getPredicate(props.match.params.id);
                document.title = `${responseJson.label} - Property - ORKG`;

                setLabel(responseJson.label);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setLabel(null);
                setError(err);
                setIsLoading(false);
            }
        };
        findPredicate();
    }, [location, props.match.params.id]);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <>
                    <Container className="d-flex align-items-center">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Property view</h1>
                        {!editMode ? (
                            <RequireAuthentication
                                component={Button}
                                className="float-right flex-shrink-0"
                                color="darkblue"
                                size="sm"
                                onClick={() => setEditMode(v => !v)}
                            >
                                <Icon icon={faPen} /> Edit
                            </RequireAuthentication>
                        ) : (
                            <Button className="float-right flex-shrink-0" color="darkblueDarker" size="sm" onClick={() => setEditMode(v => !v)}>
                                <Icon icon={faTimes} /> Stop editing
                            </Button>
                        )}
                    </Container>
                    <Container className="p-0 clearfix">
                        {editMode && (
                            <EditModeHeader className="box rounded-top">
                                <Title>
                                    Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                                </Title>
                            </EditModeHeader>
                        )}
                        <div className={`box clearfix pt-4 pb-4 pl-5 pr-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                            <div className="mb-2">
                                <div className="pb-2 mb-3">
                                    <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </h3>
                                </div>
                            </div>
                            <hr />
                            <h3 className="h5">Statements</h3>
                            <div className="clearfix">
                                <StatementBrowser
                                    rootNodeType="predicate"
                                    enableEdit={editMode}
                                    syncBackend={editMode}
                                    openExistingResourcesInDialog={false}
                                    initialSubjectId={props.match.params.id}
                                    initialSubjectLabel={label}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
                                />
                            </div>
                            <PropertyStatements propertyId={props.match.params.id} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
}

Property.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default Property;
