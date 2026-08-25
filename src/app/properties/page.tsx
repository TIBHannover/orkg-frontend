'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useEffect } from 'react';

import EntityCard from '@/components/Cards/EntityCard/EntityCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getPredicates, predicatesUrl } from '@/services/backend/predicates';
import { Predicate } from '@/services/backend/types';

const Properties = () => {
    useEffect(() => {
        document.title = 'Properties list - ORKG';
    });

    const renderListItem = (property: Predicate) => (
        <EntityCard key={property.id} item={property} href={reverse(ROUTES.PROPERTY, { id: property.id })} />
    );

    const buttons = (
        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={ROUTES.CREATE_PROPERTY}>
            <FontAwesomeIcon icon={faPlus} /> Create property
        </RequireAuthentication>
    );

    return (
        <ListPage
            label="properties"
            resourceClass="Predicate"
            renderListItem={renderListItem}
            fetchFunction={getPredicates}
            fetchFunctionName="getPredicates"
            fetchUrl={predicatesUrl}
            fetchExtraParams={{}}
            buttons={buttons}
        />
    );
};

export default Properties;
