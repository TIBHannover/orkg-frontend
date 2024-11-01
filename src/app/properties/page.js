'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import Link from 'next/link';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { getPredicates } from 'services/backend/predicates';

const Properties = () => {
    useEffect(() => {
        document.title = 'Properties list - ORKG';
    });

    const renderListItem = (property) => (
        <ShortRecord key={property.id} header={property.label} href={reverse(ROUTES.PROPERTY, { id: property.id })}>
            {property.id}
        </ShortRecord>
    );

    const fetchItems = async ({ page, pageSize }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getPredicates({
            page,
            size: pageSize,
            sortBy: 'created_at',
            desc: true,
        });

        return {
            items,
            last,
            totalElements,
        };
    };

    const buttons = (
        <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" href={ROUTES.ADD_PROPERTY}>
            <FontAwesomeIcon icon={faPlus} /> Create property
        </RequireAuthentication>
    );

    return (
        <ListPage label="properties" resourceClass={ENTITIES.PREDICATE} renderListItem={renderListItem} fetchItems={fetchItems} buttons={buttons} />
    );
};

export default Properties;
