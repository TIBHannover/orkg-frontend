'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useEffect } from 'react';

import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResources, resourcesUrl } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

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
        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={ROUTES.CREATE_RESOURCE}>
            <FontAwesomeIcon icon={faPlus} /> Create resource
        </RequireAuthentication>
    );

    return (
        <ListPage
            label="resources"
            resourceClass="Resource"
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
