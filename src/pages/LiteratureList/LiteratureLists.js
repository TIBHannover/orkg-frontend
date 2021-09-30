import { faPlus, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import SmartReviewCard from 'components/SmartReviewCard/SmartReviewCard';
import ROUTES from 'constants/routes';
import { useSelector } from 'react-redux';
import { groupBy } from 'lodash';
import { Link } from 'react-router-dom';
import { getSmartReviewData } from 'utils';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';

const LiteratureLists = () => {
    const user = useSelector(state => state.auth.user);

    const renderListItem = versions => <SmartReviewCard key={versions[0]?.id} versions={versions} showBadge={false} />;

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
                statements.map(statementsForSubject => {
                    return getSmartReviewData(resources.find(resource => resource.id === statementsForSubject.id), statementsForSubject.statements);
                })
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
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.LITERATURE_LIST_NEW}>
                <Icon icon={faPlus} /> Create list
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    to={ROUTES.USER_UNPUBLISHED_REVIEWS}
                    style={{ marginLeft: 1 }}
                >
                    <Icon icon={faEyeSlash} /> My unpublished lists
                </RequireAuthentication>
            )}
        </>
    );

    return (
        <ListPage
            label="literature lists"
            resourceClass={CLASSES.LITERATURE_LIST_PUBLISHED}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            buttons={buttons}
        />
    );
};

export default LiteratureLists;
