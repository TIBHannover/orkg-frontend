import React, { useState, useEffect } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getVisualization } from 'services/similarity/index';
import ContentLoader from 'react-content-loader';
import { getVisualizationData } from 'utils';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import PreviewCarouselComponent from './PreviewCarouselComponent';
import SingleVisualizationComponent from './SingleVisualizationComponent';

function PreviewVisualizationComparison(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [visData, setVisData] = useState([]);

    const fetchVisualizationData = () => {
        if (props.visualizations && props.visualizations.length) {
            setIsLoading(true);
            // Get the reconstruction model from the comparison service
            const reconstructionModelsCalls = Promise.all(props.visualizations.map(v => getVisualization(v.id).catch(() => false)));
            // Get the meta data for each visualization
            const visDataCalls = getStatementsBySubjects({ ids: props.visualizations.map(v => v.id) }).then(visualizationsStatements => {
                const visualizations = visualizationsStatements.map(visualizationStatements => {
                    const resourceSubject = find(props.visualizations, { id: visualizationStatements.id });
                    return getVisualizationData(resourceSubject, visualizationStatements.statements);
                });
                return visualizations;
            });
            Promise.all([visDataCalls, reconstructionModelsCalls]).then(result => {
                // zip the result
                result[0].forEach(visualization => (visualization.reconstructionModel = result[1].find(v => v.orkgOrigin === visualization.id)));
                // filter out the visualization that doesn't exist;
                const visDataObjects = result[0].filter(v => v.reconstructionModel);
                setIsLoading(false);
                setVisData(visDataObjects);
            });
        } else {
            setVisData([]);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVisualizationData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.comparisonId, JSON.stringify(props.visualizations)]);

    return (
        <div>
            {!isLoading && visData && visData.length > 0 && (
                <PreviewCarouselComponent>
                    {visData.map((data, index) => (
                        <SingleVisualizationComponent
                            key={`singleVisComp_${index}`}
                            input={data}
                            itemIndex={index}
                            expandVisualization={props.expandVisualization}
                        />
                    ))}
                </PreviewCarouselComponent>
            )}
            {isLoading && (
                <>
                    <ContentLoader
                        height={4}
                        width={50}
                        speed={2}
                        foregroundColor="#f3f3f3"
                        backgroundColor="#ecebeb"
                        style={{ borderRadius: '11px', margin: '10px 0' }}
                    >
                        <rect x="0" y="0" rx="0" ry="0" width="50" height="100" />
                    </ContentLoader>
                </>
            )}
        </div>
    );
}

PreviewVisualizationComparison.propTypes = {
    comparisonId: PropTypes.string,
    expandVisualization: PropTypes.func,
    visualizations: PropTypes.array,
};

export default PreviewVisualizationComparison;
