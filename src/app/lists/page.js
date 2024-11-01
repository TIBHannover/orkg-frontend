'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListCard from 'components/Cards/ListCard/ListCard';
import ListPage from 'components/ListPage/ListPage';
import Link from 'next/link';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { groupBy } from 'lodash';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getResources } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { convertListToNewFormat, getListData } from 'utils';

const Lists = () => {
    useEffect(() => {
        document.title = 'Lists list - ORKG';
    });

    const user = useSelector((state) => state.auth.user);

    const renderListItem = (versions) => <ListCard key={versions[0]?.id} list={convertListToNewFormat(versions)} showBadge={false} />;

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        let items = [];

        const {
            content: resources,
            last,
            totalElements,
        } = await getResources({
            include: [resourceClass],
            page,
            size: pageSize,
            sortBy: [{ property: 'created_at', direction: 'desc' }],
        });

        if (resources.length) {
            items = await getStatementsBySubjects({ ids: resources.map((item) => item.id) }).then((statements) =>
                statements.map((statementsForSubject) =>
                    getListData(
                        resources.find((_resource) => _resource.id === statementsForSubject.id),
                        statementsForSubject.statements,
                    ),
                ),
            );
            items = await Promise.all(items);
            const groupedByPaper = groupBy(items, 'listId');
            items = Object.keys(groupedByPaper).map((listId) => [...groupedByPaper[listId]]);
        }

        return {
            items,
            last,
            totalElements,
        };
    };

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
            fetchItems={fetchItems}
            buttons={buttons}
            infoContainerText={infoContainerText}
        />
    );
};

export default Lists;
