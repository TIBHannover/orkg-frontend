import { useState, useEffect, useMemo } from 'react';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getVisualization } from 'services/similarity/index';
import ContentLoader from 'react-content-loader';
import { getVisualizationData } from 'utils';
import { useSelector, useDispatch } from 'react-redux';
import { setIsOpenVisualizationModal, setUseReconstructedDataInVisualization } from 'slices/comparisonSlice';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import { find } from 'lodash';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useRelatedResources from 'components/Comparison/ComparisonCarousel/RelatedResources/useRelatedResources';
import RelatedResource from 'components/Comparison/ComparisonCarousel/RelatedResources/RelatedResource';
import RelatedFigure from 'components/Comparison/ComparisonCarousel/RelatedResources/RelatedFigure';
import { StyledSlider } from 'components/ResearchProblem/Benchmarks/styled';
import SingleVisualizationComponent from './SingleVisualizationComponent';

function ComparisonCarousel() {
    const dispatch = useDispatch();
    const [isLoadingVisualizationData, setIsLoadingVisualizationData] = useState(false);
    const [visData, setVisData] = useState([]);

    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const visualizations = useSelector(state => state.comparison.comparisonResource.visualizations);
    const data = useSelector(state => state.comparison.data);
    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const contributions = useSelector(state => state.comparison.contributions);
    const properties = useSelector(state => state.comparison.properties);
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const predicatesList = useSelector(state => state.comparison.configuration.predicatesList);

    const model = useMemo(() => new SelfVisDataModel(), []);
    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        centerMode: false,
        slidesToScroll: 5,
        nextArrow: <Icon icon={faArrowCircleRight} />,
        prevArrow: <Icon icon={faArrowCircleLeft} />,
        rows: 1,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                },
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };
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
                    const _visObjects = visObjects.map(v => ({ ...v, reconstructionModel: reconstructionModels.find(r => r.orkgOrigin === v.id) }));
                    // filter out the visualization that doesn't exist;
                    const visDataObjects = _visObjects.filter(v => v.reconstructionModel);
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

    const { relatedResources, relatedFigures } = useRelatedResources();

    return (
        <div className="py-3">
            <ErrorBoundary fallback="Something went wrong while loading the visualization!">
                {!isLoadingMetadata && !isFailedLoadingMetadata && (
                    <>
                        {!isLoadingVisualizationData && visData?.length > 0 && (
                            <StyledSlider {...settings}>
                                {visData.map((d, index) => (
                                    <SingleVisualizationComponent
                                        key={d.id}
                                        input={d}
                                        itemIndex={index}
                                        expandVisualization={val => expandVisualization(val)}
                                    />
                                ))}
                                {relatedFigures.map(({ figureId, src, title, description }) => (
                                    <RelatedFigure key={figureId} src={src} title={title} description={description} />
                                ))}
                                {relatedResources.map(({ id, url, title, description }) => (
                                    <RelatedResource key={id} url={url} title={title} description={description} />
                                ))}
                            </StyledSlider>
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
            </ErrorBoundary>
        </div>
    );
}

export default ComparisonCarousel;
