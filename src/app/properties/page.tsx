'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect } from 'react';

import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import ROUTES from '@/constants/routes';
import { getPredicates, predicatesUrl } from '@/services/backend/predicates';
import { Predicate } from '@/services/backend/types';

const Properties = () => {
    useEffect(() => {
        document.title = 'Properties list - ORKG';
    });

    const renderListItem = (property: Predicate) => (
        <ShortRecord key={property.id} header={property.label} href={reverse(ROUTES.PROPERTY, { id: property.id })}>
            {property.id}
        </ShortRecord>
    );

    const buttons = (
        <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" href={ROUTES.CREATE_PROPERTY}>
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
