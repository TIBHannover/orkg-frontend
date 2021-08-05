import ListPage from 'components/ListPage/ListPage';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { find } from 'lodash';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import { getVisualizationData } from 'utils';

const Visualizations = () => {
    const renderListItem = visualization => <VisualizationCard visualization={visualization} key={`vis${visualization.id}`} />;

    const fetchItems = async ({ page, pageSize }) => {
        const { items, last, totalElements } = await getResourcesByClass({
            id: CLASSES.VISUALIZATION,
            page: page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true
        }).then(result =>
            getStatementsBySubjects({ ids: result.content.map(p => p.id) })
                .then(visualizationsStatements =>
                    Promise.all(
                        visualizationsStatements.map(visualizationStatements =>
                            // Fetch the comparison id of each visualization
                            getStatementsByObjectAndPredicate({
                                objectId: visualizationStatements.id,
                                predicateId: PREDICATES.HAS_VISUALIZATION
                            }).then(comparisonStatement => ({
                                comparisonId: comparisonStatement.length > 0 ? comparisonStatement[0].subject.id : null,
                                ...getVisualizationData(
                                    visualizationStatements.id,
                                    find(result.content, { id: visualizationStatements.id }).label,
                                    visualizationStatements.statements
                                )
                            }))
                        )
                    )
                )
                .then(visualizationsData => {
                    return { ...result, items: visualizationsData };
                })
        );

        return {
            items,
            last,
            totalElements
        };
    };

    return (
        <ListPage
            label="visualizations"
            resourceClass={CLASSES.VISUALIZATION}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            pageSize={10}
        />
    );
};

export default Visualizations;
