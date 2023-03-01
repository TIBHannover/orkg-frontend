import { useEffect } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ComparisonCard from 'components/Cards/ComparisonCard/ComparisonCard';
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
    useEffect(() => {
        document.title = 'Comparisons list - ORKG';
    });

    const renderListItem = comparison => <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />;

    const fetchItems = async ({ page, pageSize }) => {
        const { items, last, totalElements } = await getResourcesByClass({
            id: CLASSES.COMPARISON,
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
        }).then(async result => ({
            ...result,
            items: groupVersionsOfComparisons(
                await getStatementsBySubjects({ ids: result.content.map(p => p.id) }).then(comparisonsStatements =>
                    comparisonsStatements.map(comparisonStatements =>
                        getComparisonData(find(result.content, { id: comparisonStatements.id }), comparisonStatements.statements),
                    ),
                ),
            ),
        }));

        return {
            items,
            last,
            totalElements,
        };
    };

    const buttons = (
        <>
            <RequireAuthentication
                component={Link}
                color="secondary"
                size="sm"
                className="btn btn-secondary btn-sm flex-shrink-0"
                to={ROUTES.ADD_COMPARISON}
            >
                <Icon icon={faPlus} /> Create comparison
            </RequireAuthentication>
            <Link style={{ marginLeft: '1px' }} className="btn btn-secondary btn-sm flex-shrink-0" to={ROUTES.FEATURED_COMPARISONS}>
                Featured comparisons
            </Link>
        </>
    );

    const infoContainerText = (
        <>
            ORKG comparisons provide condensed overviews of the state-of-the-art for a particular research question.{' '}
            <a href="https://orkg.org/about/15/Comparisons" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    return (
        <ListPage
            label="comparisons"
            resourceClass={CLASSES.COMPARISON}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            buttons={buttons}
            pageSize={15}
            infoContainerText={infoContainerText}
        />
    );
};

export default Comparisons;
