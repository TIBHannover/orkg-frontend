'use client';

import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import ListPage from 'components/PaginatedContent/ListPage';
import { CLASSES } from 'constants/graphSettings';
import { useEffect } from 'react';
import { Visualization } from 'services/backend/types';
import { getVisualizations, visualizationsUrl } from 'services/backend/visualizations';

const Visualizations = () => {
    useEffect(() => {
        document.title = 'Visualizations list - ORKG';
    });

    const renderListItem = (visualization: Visualization) => <VisualizationCard visualization={visualization} key={visualization.id} />;

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
            fetchFunction={getVisualizations}
            fetchUrl={visualizationsUrl}
            fetchFunctionName="getVisualizations"
            fetchExtraParams={{}}
            renderListItem={renderListItem}
            defaultPageSize={10}
            infoContainerText={infoContainerText}
        />
    );
};

export default Visualizations;
