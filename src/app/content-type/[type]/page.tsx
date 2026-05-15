'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import pluralize from 'pluralize';
import { useEffect } from 'react';

import NotFound from '@/app/not-found';
import { additionalContentTypes } from '@/components/ContentType/types';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResources, resourcesUrl } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

function ContentTypes() {
    const { type } = useParams();

    let notFound = false;
    const contentType = additionalContentTypes.find((ct) => ct.id === type);
    if (!contentType) {
        notFound = true;
    }

    useEffect(() => {
        document.title = `${pluralize(contentType?.label || '', 0, false)} list - ORKG`;
    }, [contentType?.label]);

    const renderListItem = (resource: Resource) => (
        <ShortRecord key={resource.id} header={resource.label} href={reverse(ROUTES.CONTENT_TYPE, { id: resource.id, type })}>
            {resource.id}
        </ShortRecord>
    );

    const buttons = (
        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={`${ROUTES.CONTENT_TYPE_NEW}?type=${type}`}>
            <FontAwesomeIcon icon={faPlus} /> Create new
        </RequireAuthentication>
    );

    if (notFound || !contentType) {
        return <NotFound />;
    }

    return (
        <ListPage
            label={pluralize(contentType.label, 0, false)}
            resourceClass={contentType.id}
            renderListItem={renderListItem}
            fetchFunction={getResources}
            fetchFunctionName="getResources"
            fetchUrl={resourcesUrl}
            fetchExtraParams={{ include: [type] }}
            buttons={buttons}
            key={type}
        />
    );
}

export default ContentTypes;
