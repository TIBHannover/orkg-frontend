import { faPlus, faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';

const UserUnpublishedArticles = ({ userId }) => {
    const renderListItem = article => (
        <ShortRecord key={article.id} header={article.label} href={reverse(ROUTES.SMART_ARTICLE, { id: article.id })}>
            <div className="time">
                <Icon size="sm" icon={faCalendar} className="mr-1" /> {article.created_at ? moment(article.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        const { content: resources, last, totalElements } = await getResourcesByClass({
            id: resourceClass,
            page,
            items: pageSize,
            sortBy: 'created_at',
            creator: userId,
            desc: true
        });

        if (resources.length) {
            return Promise.all(
                resources.map(resource => getStatementsByObjectAndPredicate({ objectId: resource.id, predicateId: PREDICATES.HAS_PAPER }))
            )
                .then(resourcesStatements =>
                    resourcesStatements.map((statements, idx) => {
                        if (!statements.length) {
                            return resources[idx];
                        }
                        return null;
                    })
                )
                .then(unpublishedItems => {
                    return {
                        items: unpublishedItems.filter(v => v),
                        last,
                        totalElements
                    };
                });
        } else {
            return {
                items: [],
                last,
                totalElements
            };
        }
    };

    const buttons = (
        <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.SMART_ARTICLE_NEW}>
            <Icon icon={faPlus} /> Create article
        </RequireAuthentication>
    );

    return (
        <>
            <ListPage
                label="unpublished smart articles"
                resourceClass={CLASSES.SMART_ARTICLE}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                buttons={buttons}
                pageSize={50}
                hideEmptyList={true}
            />
        </>
    );
};

UserUnpublishedArticles.propTypes = {
    userId: PropTypes.string.isRequired
};

export default UserUnpublishedArticles;
