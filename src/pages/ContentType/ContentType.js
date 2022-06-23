import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropertySuggestions from 'components/ContentType/PropertySuggestions/PropertySuggestions';
import { supportedContentTypes } from 'components/ContentType/types';
import EditableHeader from 'components/EditableHeader';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { upperFirst } from 'lodash';
import { reverse } from 'named-urls';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import Unauthorized from 'pages/Unauthorized';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Container } from 'reactstrap';
import { getResource } from 'services/backend/resources';

function ContentType() {
    const [error, setError] = useState(null);
    const [resource, setResource] = useState(null);
    const [contentType, setContentType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const [editMode, setEditMode] = useState(params.mode === 'edit' || false);
    const user = useSelector(state => state.auth.user);
    const navigate = useNavigate();
    const resourceId = params.id;

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const _resource = await getResource(resourceId);
                const contentTypes = _resource.classes.filter(classId => supportedContentTypes.find(c => c.id === classId));
                if (!contentTypes.length === 0) {
                    throw new Error('Content type not supported');
                }
                if (!contentTypes.length > 1) {
                    throw new Error('Multiple content types not supported');
                }
                const _contentType = supportedContentTypes.find(c => c.id === contentTypes[0]);
                setContentType(_contentType);
                document.title = `${_resource.label} - ${_contentType.label} - ORKG`;
                setResource(_resource);
            } catch (e) {
                console.error(e);
                setResource(null);
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [params.id, resourceId]);

    const toggleEdit = () => {
        setEditMode(v => !v);
        navigate(
            reverse(params.mode !== 'edit' ? ROUTES.CONTENT_TYPE : ROUTES.CONTENT_TYPE_NO_MODE, {
                type: params.type,
                id: params.id,
                mode: params.mode !== 'edit' ? 'edit' : null,
            }),
        );
    };

    const handleHeaderChange = event => {
        setResource(prev => ({ ...prev, label: event.value }));
    };

    if (!isLoading && !user && editMode) {
        return <Unauthorized />;
    }

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {!editMode ? (
                                    <RequireAuthentication component={Button} className="float-end" color="secondary" size="sm" onClick={toggleEdit}>
                                        <Icon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={toggleEdit}>
                                        <Icon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </>
                        }
                    >
                        {contentType.label && upperFirst(contentType.label)}
                    </TitleBar>
                    <EditModeHeader isVisible={editMode} />
                    <Container className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        <div className="">
                            {!editMode ? (
                                <div className="pb-2">
                                    <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {resource.label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </h3>
                                </div>
                            ) : (
                                <EditableHeader id={params.id} value={resource.label} onChange={handleHeaderChange} />
                            )}
                        </div>
                        <hr />
                        <StatementBrowser
                            enableEdit={editMode}
                            syncBackend={editMode}
                            openExistingResourcesInDialog={false}
                            initialSubjectId={resourceId}
                            newStore={true}
                            propertiesAsLinks={true}
                            resourcesAsLinks={true}
                            propertySuggestionsComponent={<PropertySuggestions />}
                            keyToKeepStateOnLocationChange={resourceId}
                        />
                    </Container>
                </>
            )}
        </>
    );
}

export default ContentType;
