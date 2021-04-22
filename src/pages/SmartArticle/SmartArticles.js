import { useEffect } from 'react';
import { faPlus, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { useSelector } from 'react-redux';
import { groupBy } from 'lodash';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';

const SmartArticles = () => {
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        document.title = 'SmartReviews - ORKG';
    });

    const renderListItem = versions => (
        <ShortRecord key={versions[0]?.id} header={versions[0]?.label} href={reverse(ROUTES.SMART_ARTICLE, { id: versions[0]?.id })}>
            {versions.length > 1 && (
                <>
                    All versions:{' '}
                    {versions.map((version, index) => (
                        <span key={version.id}>
                            <Tippy content={version.label}>
                                <Link to={reverse(ROUTES.SMART_ARTICLE, { id: version.id })}>Version {versions.length - index}</Link>
                            </Tippy>{' '}
                            {index < versions.length - 1 && ' • '}
                        </span>
                    ))}
                </>
            )}
        </ShortRecord>
    );

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        let items = [];

        const { content: resources, last, totalElements } = await getResourcesByClass({
            id: resourceClass,
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        });

        if (resources.length) {
            items = await getStatementsBySubjects({ ids: resources.map(item => item.id) }).then(statements =>
                statements.map(statementsForSubject => ({
                    ...resources.find(resource => resource.id === statementsForSubject.id),
                    paperId: statementsForSubject.statements.find(statement => statement.predicate.id === PREDICATES.HAS_PAPER)?.object?.id
                }))
            );
            const groupedByPaper = groupBy(items, 'paperId');
            items = Object.keys(groupedByPaper).map(paperId => [...groupedByPaper[paperId]]);
        }

        return {
            items,
            last,
            totalElements
        };
    };

    const buttons = (
        <>
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.SMART_ARTICLE_NEW}>
                <Icon icon={faPlus} /> Create article
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    to={ROUTES.USER_UNPUBLISHED_ARTICLES}
                    style={{ marginLeft: 1 }}
                >
                    <Icon icon={faEyeSlash} /> My unpublished articles
                </RequireAuthentication>
            )}
        </>
    );

    return (
        <>
            <ListPage
                label="SmartReviews"
                resourceClass={CLASSES.SMART_ARTICLE_PUBLISHED}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                buttons={buttons}
            />
        </>
    );
};

export default SmartArticles;
