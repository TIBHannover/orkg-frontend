'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

import ListCard from '@/components/Cards/ListCard/ListCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getLiteratureLists, listsUrl } from '@/services/backend/literatureLists';
import { LiteratureList, VisibilityOptions } from '@/services/backend/types';

const Lists = () => {
    useEffect(() => {
        document.title = 'Lists list - ORKG';
    });

    const { user } = useAuthentication();

    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

    const renderListItem = (list: LiteratureList) => <ListCard key={list.id} list={list} showBadge={false} />;

    const buttons = (
        <>
            <VisibilityFilter />
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" href={ROUTES.LIST_NEW}>
                <FontAwesomeIcon icon={faPlus} /> Create list
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    href={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-lists' })}
                    style={{ marginLeft: 1 }}
                >
                    Draft lists
                </RequireAuthentication>
            )}
        </>
    );

    const infoContainerText = (
        <>
            ORKG lists provide a way to organize state-of-the-art literature for a specific research domain.{' '}
            <a href="https://orkg.org/about/17/Lists" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    return (
        <ListPage
            label="lists"
            resourceClass={CLASSES.LITERATURE_LIST_PUBLISHED}
            renderListItem={renderListItem}
            fetchFunction={getLiteratureLists}
            fetchFunctionName="getLiteratureLists"
            fetchUrl={listsUrl}
            fetchExtraParams={{ published: true, visibility }}
            buttons={buttons}
            infoContainerText={infoContainerText}
        />
    );
};

export default Lists;
