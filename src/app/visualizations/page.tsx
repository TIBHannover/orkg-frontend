'use client';

import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

import VisualizationCard from '@/components/Cards/VisualizationCard/VisualizationCard';
import ListPage from '@/components/PaginatedContent/ListPage';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import { VisibilityOptions, Visualization } from '@/services/backend/types';
import { getVisualizations, visualizationsUrl } from '@/services/backend/visualizations';

const Visualizations = () => {
    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

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
            fetchExtraParams={{ visibility }}
            renderListItem={renderListItem}
            defaultPageSize={10}
            buttons={<VisibilityFilter />}
            infoContainerText={infoContainerText}
        />
    );
};

export default Visualizations;
