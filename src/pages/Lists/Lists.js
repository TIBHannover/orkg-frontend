import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import ListCard from 'components/List/ListCard';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { groupBy } from 'lodash';
import { reverse } from 'named-urls';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getListData } from 'utils';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';

const Lists = () => {
    const user = useSelector(state => state.auth.user);

    const renderListItem = versions => <ListCard key={versions[0]?.id} versions={versions} showBadge={false} />;

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
                    return getListData(resources.find(_resource => _resource.id === statementsForSubject.id), statementsForSubject.statements);
                })
            );
            const groupedByPaper = groupBy(items, 'listId');
            items = Object.keys(groupedByPaper).map(listId => [...groupedByPaper[listId]]);
        }

        return {
            items,
            last,
            totalElements
        };
    };

    const buttons = (
        <>
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.LIST_NEW}>
                <Icon icon={faPlus} /> Create list
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    to={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-lists' })}
                    style={{ marginLeft: 1 }}
                >
                    Draft lists
                </RequireAuthentication>
            )}
        </>
    );

    return (
        <ListPage
            label="lists"
            resourceClass={CLASSES.LITERATURE_LIST_PUBLISHED}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            buttons={buttons}
        />
    );
};

export default Lists;
