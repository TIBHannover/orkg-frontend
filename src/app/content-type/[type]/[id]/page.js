'use client';

import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import { supportedContentTypes } from 'components/ContentType/types';
import DataBrowser from 'components/DataBrowser/DataBrowser';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import useAuthentication from 'components/hooks/useAuthentication';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import TitleBar from 'components/TitleBar/TitleBar';
import Unauthorized from 'components/Unauthorized/Unauthorized';
import useParams from 'components/useParams/useParams';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { upperFirst } from 'lodash';
import { useEffect, useState } from 'react';
import { Button, Container } from 'reactstrap';
import { getResource } from 'services/backend/resources';

function ContentType() {
    const [error, setError] = useState(null);
    const [resource, setResource] = useState(null);
    const [contentType, setContentType] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();
    const { user } = useAuthentication();
    const resourceId = params.id;

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const _resource = await getResource(resourceId);
                const contentTypes = _resource.classes.filter((classId) => supportedContentTypes.find((c) => c.id === classId));
                if (!contentTypes.length === 0) {
                    throw new Error('Content type not supported');
                }
                if (!contentTypes.length > 1) {
                    throw new Error('Multiple content types not supported');
                }
                const _contentType = supportedContentTypes.find((c) => c.id === contentTypes[0]);
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

    const handleHeaderChange = (val) => {
        setResource((prev) => ({ ...prev, label: val }));
    };

    if (!isLoading && !user && isEditMode) {
        return <Unauthorized />;
    }

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />}</>}
            {!isLoading && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {!isEditMode ? (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </>
                        }
                    >
                        {contentType.label && upperFirst(contentType.label)}
                    </TitleBar>
                    <EditModeHeader isVisible={isEditMode} />
                    <Container className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
                        <DataBrowser isEditMode={isEditMode} id={resourceId} propertiesAsLinks valuesAsLinks />
                    </Container>
                </>
            )}
        </>
    );
}

export default ContentType;
