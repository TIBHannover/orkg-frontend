'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListCard from 'components/Cards/ListCard/ListCard';
import ListPage from 'components/PaginatedContent/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getLiteratureLists, listsUrl } from 'services/backend/literatureLists';
import { LiteratureList } from 'services/backend/types';
import { RootStore } from 'slices/types';

const Lists = () => {
    useEffect(() => {
        document.title = 'Lists list - ORKG';
    });

    const user = useSelector((state: RootStore) => state.auth.user);

    const renderListItem = (list: LiteratureList) => <ListCard key={list.id} list={list} showBadge={false} />;

    const buttons = (
        <>
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
            fetchExtraParams={{ published: true }}
            buttons={buttons}
            infoContainerText={infoContainerText}
        />
    );
};

export default Lists;
