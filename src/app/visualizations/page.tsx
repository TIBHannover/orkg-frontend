'use client';

import VisualizationCard from 'components/Cards/VisualizationCard/VisualizationCard';
import ListPage from 'components/ListPage/ListPage';
import { CLASSES } from 'constants/graphSettings';
import { useEffect } from 'react';
import { Visualization } from 'services/backend/types';
import { getVisualizations } from 'services/backend/visualizations';

const Visualizations = () => {
    useEffect(() => {
        document.title = 'Visualizations list - ORKG';
    });

    const renderListItem = (visualization: Visualization) => <VisualizationCard visualization={visualization} key={visualization.id} />;

    const fetchItems = async ({ page, pageSize }: { page: number; pageSize: number }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getVisualizations({ page, size: pageSize, sortBy: [{ property: 'created_at', direction: 'desc' }] });

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
            // @ts-expect-error
            infoContainerText={infoContainerText}
        />
    );
};

export default Visualizations;
