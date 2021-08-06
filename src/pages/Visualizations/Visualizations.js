import ListPage from 'components/ListPage/ListPage';
import VisualizationCard from 'components/VisualizationCard/VisualizationCard';
import { CLASSES } from 'constants/graphSettings';
import { find } from 'lodash';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';
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
                    visualizationsStatements.map(visualizationStatements => {
                        return getVisualizationData(find(result.content, { id: visualizationStatements.id }), visualizationStatements.statements);
                    })
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
