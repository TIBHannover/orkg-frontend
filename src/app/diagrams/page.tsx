'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useEffect } from 'react';

import DiagramCard from '@/components/Cards/DiagramCard/DiagramCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getResources, resourcesUrl } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

const Diagrams = () => {
    useEffect(() => {
        document.title = 'Diagrams - ORKG';
    });

    const renderListItem = (diagram: Resource) => <DiagramCard key={diagram?.id} diagram={diagram} />;

    const buttons = (
        <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" href={ROUTES.NEW_DIAGRAM}>
            <Icon icon={faPlus} /> Create diagram
        </RequireAuthentication>
    );

    return (
        <ListPage
            label="diagrams"
            resourceClass={CLASSES.DIAGRAM}
            renderListItem={renderListItem}
            fetchUrl={resourcesUrl}
            fetchExtraParams={{ include: [CLASSES.DIAGRAM] }}
            fetchFunction={getResources}
            fetchFunctionName="getResources"
            buttons={buttons}
        />
    );
};

export default Diagrams;
