import { useState, useEffect, useMemo } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getVisualization } from 'services/similarity/index';
import ContentLoader from 'react-content-loader';
import { getVisualizationData } from 'utils';
import { useSelector, useDispatch } from 'react-redux';
import { setIsOpenVisualizationModal, setUseReconstructedDataInVisualization } from 'slices/comparisonSlice';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { find } from 'lodash';
import PreviewCarouselComponent from './PreviewCarouselComponent';
import SingleVisualizationComponent from './SingleVisualizationComponent';

function PreviewVisualizationComparison() {
    const dispatch = useDispatch();
    const [isLoadingVisualizationData, setIsLoadingVisualizationData] = useState(false);
    const [visData, setVisData] = useState([]);

    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const visualizations = useSelector(state => state.comparison.comparisonResource.visualizations);
    const data = useSelector(state => state.comparison.data);
    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const contributions = useSelector(state => state.comparison.contributions.filter(c => c.active));
    const properties = useSelector(state => state.comparison.properties.filter(c => c.active));
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const predicatesList = useSelector(state => state.comparison.configuration.predicatesList);

    const model = useMemo(() => new SelfVisDataModel(), []);

    useEffect(() => {
        const integrateData = () => {
            model.integrateInputData({
                metaData: comparisonResource,
                contributions,
                properties,
                data,
                contributionsList,
                predicatesList,
            });
            return true;
        };
        integrateData();
    }, [comparisonResource, contributions, contributionsList, data, model, predicatesList, properties]);

    /**
     * Expand a preview of a visualization
     *
     * @param {Boolean} val weather to use reconstructed data
     */
    const expandVisualization = val => {
        dispatch(setUseReconstructedDataInVisualization(val));
        if (!val) {
            model.resetCustomizationModel();
        }
        dispatch(setIsOpenVisualizationModal(true));
    };

    useEffect(() => {
        const fetchVisualizationData = () => {
            if (visualizations?.length) {
                setIsLoadingVisualizationData(true);
                // Get the reconstruction model from the comparison service
                const reconstructionModelsCalls = Promise.all(visualizations.map(v => getVisualization(v.id).catch(() => false)));
                // Get the meta data for each visualization
                const visObjectCalls = getStatementsBySubjects({ ids: visualizations.map(v => v.id) }).then(visualizationsStatements => {
                    const vis = visualizationsStatements.map(visualizationStatements => {
                        const resourceSubject = find(visualizations, { id: visualizationStatements.id });
                        return getVisualizationData(resourceSubject, visualizationStatements.statements);
                    });
                    return vis;
                });
                Promise.all([visObjectCalls, reconstructionModelsCalls]).then(([visObjects, reconstructionModels]) => {
                    // zip the result
                    visObjects.forEach(v => {
                        // eslint-disable-next-line no-param-reassign
                        v.reconstructionModel = reconstructionModels.find(r => r.orkgOrigin === v.id);
                    });
                    // filter out the visualization that doesn't exist;
                    const visDataObjects = visObjects.filter(v => v.reconstructionModel);
                    setIsLoadingVisualizationData(false);
                    setVisData(visDataObjects);
                });
            } else {
                setVisData([]);
                setIsLoadingVisualizationData(false);
            }
        };
        fetchVisualizationData();
    }, [visualizations]);

    return (
        <div>
            {!isLoadingMetadata && !isFailedLoadingMetadata && (
                <>
                    {!isLoadingVisualizationData && visData?.length > 0 && (
                        <PreviewCarouselComponent>
                            {visData.map((d, index) => (
                                <SingleVisualizationComponent
                                    key={`singleVisComp_${index}`}
                                    input={d}
                                    itemIndex={index}
                                    expandVisualization={val => expandVisualization(val)}
                                />
                            ))}
                        </PreviewCarouselComponent>
                    )}
                    {isLoadingVisualizationData && (
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
                </>
            )}
        </div>
    );
}

export default PreviewVisualizationComparison;
