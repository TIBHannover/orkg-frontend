'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/PaginatedContent/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect } from 'react';
import { getResources, resourcesUrl } from 'services/backend/resources';
import { Resource } from 'services/backend/types';

const Resources = () => {
    useEffect(() => {
        document.title = 'Resources list - ORKG';
    });

    const renderListItem = (resource: Resource) => (
        <ShortRecord key={resource.id} header={resource.label} href={`${reverse(ROUTES.RESOURCE, { id: resource.id })}?noRedirect`}>
            {resource.id}
        </ShortRecord>
    );

    const buttons = (
        <RequireAuthentication
            component={Link}
            color="secondary"
            size="sm"
            className="btn btn-secondary btn-sm flex-shrink-0"
            href={ROUTES.ADD_RESOURCE}
        >
            <FontAwesomeIcon icon={faPlus} /> Create resource
        </RequireAuthentication>
    );

    return (
        <ListPage
            label="resources"
            resourceClass={ENTITIES.RESOURCE}
            renderListItem={renderListItem}
            fetchFunction={getResources}
            fetchFunctionName="getResources"
            fetchUrl={resourcesUrl}
            fetchExtraParams={{}}
            buttons={buttons}
            boxShadow
        />
    );
};

export default Resources;
