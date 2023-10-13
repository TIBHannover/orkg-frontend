'use client';

import Link from 'components/NextJsMigration/Link';
import { useEffect } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { getResources } from 'services/backend/resources';

const Resources = () => {
    useEffect(() => {
        document.title = 'Resources list - ORKG';
    });

    const renderListItem = resource => (
        <ShortRecord key={resource.id} header={resource.label} href={`${reverse(ROUTES.RESOURCE, { id: resource.id })}?noRedirect`}>
            {resource.id}
        </ShortRecord>
    );

    const fetchItems = async ({ page, pageSize }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getResources({
            page,
            items: pageSize,
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
        <RequireAuthentication
            component={Link}
            color="secondary"
            size="sm"
            className="btn btn-secondary btn-sm flex-shrink-0"
            href={ROUTES.ADD_RESOURCE}
        >
            <Icon icon={faPlus} /> Create resource
        </RequireAuthentication>
    );

    return <ListPage label="resources" resourceClass={ENTITIES.RESOURCE} renderListItem={renderListItem} fetchItems={fetchItems} buttons={buttons} />;
};

export default Resources;
