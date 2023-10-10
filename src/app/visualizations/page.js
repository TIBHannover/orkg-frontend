'use client';

import { useEffect } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import ListPage from 'components/ListPage/ListPage';
import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import { CLASSES } from 'constants/graphSettings';
import { find } from 'lodash';
import { getResourcesByClass } from 'services/backend/resources';
import { addAuthorsToStatementBundle, getVisualizationData } from 'utils';

const Visualizations = () => {
    useEffect(() => {
        document.title = 'Visualizations list - ORKG';
    });

    const renderListItem = visualization => <VisualizationCard visualization={visualization} key={`vis${visualization.id}`} />;

    const fetchItems = async ({ page, pageSize }) => {
        const { items, last, totalElements } = await getResourcesByClass({
            id: CLASSES.VISUALIZATION,
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
        }).then(result =>
            getStatementsBySubjects({ ids: result.content.map(p => p.id) })
                .then(statements => addAuthorsToStatementBundle(statements))
                .then(visualizationsStatements =>
                    visualizationsStatements.map(visualizationStatements =>
                        getVisualizationData(find(result.content, { id: visualizationStatements.id }), visualizationStatements.statements),
                    ),
                )
                .then(visualizationsData => ({ ...result, items: visualizationsData })),
        );

        return {
            items,
            last,
            totalElements,
        };
    };

    const infoContainerText = (
        <>
            ORKG visualizations are generated from ORKG comparisons.{' '}
            <a href="https://orkg.org/about/15/Comparisons" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    return (
        <ListPage
            label="visualizations"
            resourceClass={CLASSES.VISUALIZATION}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            pageSize={10}
            infoContainerText={infoContainerText}
        />
    );
};

export default Visualizations;
