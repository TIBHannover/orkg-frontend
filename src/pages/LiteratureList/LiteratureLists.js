import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import ListCard from 'components/LiteratureList/ListCard';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { groupBy } from 'lodash';
import { reverse } from 'named-urls';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';

const LiteratureLists = () => {
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
                    const resource = resources.find(_resource => _resource.id === statementsForSubject.id);
                    const _statements = statementsForSubject.statements;
                    const description = filterObjectOfStatementsByPredicateAndClass(_statements, PREDICATES.DESCRIPTION, true);
                    const listId = filterObjectOfStatementsByPredicateAndClass(_statements, PREDICATES.HAS_LIST, true)?.id;
                    const researchField = filterObjectOfStatementsByPredicateAndClass(
                        _statements,
                        PREDICATES.HAS_RESEARCH_FIELD,
                        true,
                        CLASSES.RESEARCH_FIELD
                    );
                    const authors = filterObjectOfStatementsByPredicateAndClass(_statements, PREDICATES.HAS_AUTHOR, false);
                    return {
                        ...resource,
                        id: resource.id,
                        label: resource.label ? resource.label : 'No Title',
                        description: description?.label ?? '',
                        researchField,
                        authors,
                        listId
                    };
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
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.LITERATURE_LIST_NEW}>
                <Icon icon={faPlus} /> Create list
            </RequireAuthentication>
            {!!user && (
                <RequireAuthentication
                    component={Link}
                    color="secondary"
                    size="sm"
                    className="btn btn-secondary btn-sm"
                    to={reverse(ROUTES.USER_SETTINGS, { tab: 'draft-literature-lists' })}
                    style={{ marginLeft: 1 }}
                >
                    Draft lists
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
