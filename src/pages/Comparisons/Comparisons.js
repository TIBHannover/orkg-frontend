import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { find } from 'lodash';
import { Link } from 'react-router-dom';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonData, groupVersionsOfComparisons } from 'utils';

const Comparisons = () => {
    const renderListItem = comparison => <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />;

    const fetchItems = async ({ page, pageSize }) => {
        const { items, last, totalElements } = await getResourcesByClass({
            id: CLASSES.COMPARISON,
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(async result => ({
            ...result,
            items: groupVersionsOfComparisons(
                await getStatementsBySubjects({ ids: result.content.map(p => p.id) }).then(comparisonsStatements =>
                    comparisonsStatements.map(comparisonStatements =>
                        getComparisonData(find(result.content, { id: comparisonStatements.id }), comparisonStatements.statements)
                    )
                )
            )
        }));

        return {
            items,
            last,
            totalElements
        };
    };

    const buttons = (
        <RequireAuthentication
            component={Link}
            color="secondary"
            size="sm"
            className="btn btn-secondary btn-sm flex-shrink-0"
            to={ROUTES.ADD_COMPARISON}
        >
            <Icon icon={faPlus} /> Create comparison
        </RequireAuthentication>
    );

    return (
        <ListPage
            label="comparisons"
            resourceClass={CLASSES.COMPARISON}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            buttons={buttons}
            pageSize={15}
        />
    );
};

export default Comparisons;
