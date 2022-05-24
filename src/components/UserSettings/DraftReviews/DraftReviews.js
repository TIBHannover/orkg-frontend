import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';

const DraftReviews = () => {
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        document.title = 'Draft reviews - ORKG';
    });

    const renderListItem = article => (
        <ShortRecord key={article.id} header={article.label} href={reverse(ROUTES.REVIEW, { id: article.id })}>
            <div className="time">
                <Icon size="sm" icon={faCalendar} className="me-1" /> {article.created_at ? moment(article.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        const { content: resources, last, totalElements } = await getResourcesByClass({
            id: resourceClass,
            page,
            items: pageSize,
            sortBy: 'created_at',
            creator: user.id,
            desc: true,
        });

        if (resources.length) {
            return Promise.all(
                resources.map(resource => getStatementsByObjectAndPredicate({ objectId: resource.id, predicateId: PREDICATES.HAS_PAPER })),
            )
                .then(resourcesStatements =>
                    resourcesStatements.map((statements, idx) => {
                        if (!statements.length) {
                            return resources[idx];
                        }
                        return null;
                    }),
                )
                .then(unpublishedItems => {
                    const items = unpublishedItems.filter(v => v);
                    return {
                        items,
                        last,
                        totalElements: items.length,
                    };
                });
        }
        return {
            items: [],
            last,
            totalElements,
        };
    };

    return (
        <div>
            <div className="box rounded pt-4 pb-3 px-4 mb-3">
                <h2 className="h5">View draft reviews</h2>
                <Alert color="info" className="mt-3" fade={false}>
                    When you start working on a review, by default it is a draft version. Those versions are listed on this page. As soon as you
                    publish a review, it becomes publicly listed
                </Alert>
            </div>

            <ListPage
                label="draft reviews"
                resourceClass={CLASSES.SMART_REVIEW}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                pageSize={50}
                disableSearch={true}
                hideTitleBar
            />
        </div>
    );
};

DraftReviews.propTypes = {};

export default DraftReviews;
