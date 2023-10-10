'use client';

import Link from 'components/NextJsMigration/Link';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { supportedContentTypes } from 'components/ContentType/types';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import NotFound from 'app/not-found';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import useParams from 'components/NextJsMigration/useParams';
import { getResourcesByClass } from 'services/backend/resources';

function ContentTypes() {
    const { type } = useParams();
    const [contentType, setContentType] = useState(null);
    const [notFound, setNotFound] = useState(null);

    useEffect(() => {
        if (type) {
            const _contentType = supportedContentTypes.find(ct => ct.id === type);
            if (!_contentType) {
                setNotFound(true);
            }
            setContentType(_contentType);
        }
    }, [type]);

    useEffect(() => {
        document.title = `${pluralize(contentType?.label || '', 0, false)} list - ORKG`;
    }, [contentType?.label]);

    const renderListItem = resource => (
        <ShortRecord key={resource.id} header={resource.label} href={reverse(ROUTES.CONTENT_TYPE, { id: resource.id, type })}>
            {resource.id}
        </ShortRecord>
    );

    const fetchItems = async ({ page, pageSize }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getResourcesByClass({
            id: type,
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
            href={reverse(ROUTES.CONTENT_TYPE_NEW, { type })}
        >
            <Icon icon={faPlus} /> Create new
        </RequireAuthentication>
    );

    if (notFound) {
        return <NotFound />;
    }

    return (
        <ListPage
            label={pluralize(contentType?.label || '', 0, false)}
            resourceClass={ENTITIES.RESOURCE}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            buttons={buttons}
            key={type}
        />
    );
}

export default ContentTypes;
