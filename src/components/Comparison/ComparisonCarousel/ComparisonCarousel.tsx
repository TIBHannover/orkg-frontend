import { faArrowCircleLeft, faArrowCircleRight, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import useRelatedFigures from '@/components/Comparison/ComparisonCarousel/RelatedFigures/hooks/useRelatedFigures';
import RelatedFigureCard from '@/components/Comparison/ComparisonCarousel/RelatedFigures/RelatedFigureCard';
import RelatedFiguresModal from '@/components/Comparison/ComparisonCarousel/RelatedFigures/RelatedFiguresModal/RelatedFiguresModal';
import useRelatedResources from '@/components/Comparison/ComparisonCarousel/RelatedResources/hooks/useRelatedResources';
import RelatedResourceCard from '@/components/Comparison/ComparisonCarousel/RelatedResources/RelatedResourceCard';
import RelatedResourcesModal from '@/components/Comparison/ComparisonCarousel/RelatedResources/RelatedResourcesModal/RelatedResourcesModal';
import useVisualizations from '@/components/Comparison/ComparisonCarousel/Visualizations/hooks/useVisualizations';
import VisualizationCard from '@/components/Comparison/ComparisonCarousel/Visualizations/VisualizationCard';
import VisualizationsModal from '@/components/Comparison/ComparisonCarousel/Visualizations/VisualizationsModal/VisualizationsModal';
import useComparison from '@/components/Comparison/hooks/useComparison';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import StyledSlider from '@/components/ResearchProblem/Benchmarks/styled';
import Button from '@/components/Ui/Button/Button';
import Container from '@/components/Ui/Structure/Container';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';

const ComparisonCarousel = () => {
    const [isOpenVisualizationsModal, setIsOpenVisualizationsModal] = useState(false);
    const [isOpenRelatedResourcesModal, setIsOpenRelatedResourcesModal] = useState(false);
    const [isOpenRelatedFiguresModal, setIsOpenRelatedFiguresModal] = useState(false);
    const { comparison } = useComparison();
    const { relatedResources, isLoadingRelatedResources } = useRelatedResources();
    const { relatedFigures, isLoadingRelatedFigures } = useRelatedFigures();
    const { visualizations } = useVisualizations();
    const { isEditMode } = useIsEditMode();

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        centerMode: false,
        slidesToScroll: 5,
        nextArrow: <FontAwesomeIcon icon={faArrowCircleRight} />,
        prevArrow: <FontAwesomeIcon icon={faArrowCircleLeft} />,
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

    if (!comparison) {
        return null;
    }

    const hasData =
        (visualizations && visualizations?.length > 0) ||
        (relatedFigures && relatedFigures.length > 0) ||
        (relatedResources && relatedResources.length > 0);

    return hasData || isEditMode ? (
        <Container className="box rounded position-relative mb-4 px-5 py-3">
            <ErrorBoundary fallback="Something went wrong while loading the visualization!">
                {!isLoadingRelatedResources && !isLoadingRelatedFigures && hasData && (
                    <StyledSlider {...settings}>
                        {visualizations?.map(({ id }) => (
                            <VisualizationCard key={id} id={id} />
                        ))}

                        {relatedResources &&
                            relatedResources.map(({ id, url, label, description }) => (
                                <RelatedResourceCard key={id} url={url} title={label} description={description} />
                            ))}

                        {relatedFigures &&
                            relatedFigures.map(({ id, image, label, description }) => (
                                <RelatedFigureCard key={id} src={image} title={label} description={description} />
                            ))}
                    </StyledSlider>
                )}
                {(isLoadingRelatedResources || isLoadingRelatedFigures) && (
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
                )}
            </ErrorBoundary>
            {isEditMode && (
                <>
                    <Button
                        color="secondary"
                        size="sm"
                        className="mt-2 me-1"
                        style={{ marginRight: 2 }}
                        onClick={() => setIsOpenVisualizationsModal(true)}
                    >
                        <FontAwesomeIcon icon={faPen} /> Edit visualizations
                    </Button>
                    <Button
                        color="secondary"
                        size="sm"
                        className="mt-2 me-1"
                        style={{ marginRight: 2 }}
                        onClick={() => setIsOpenRelatedResourcesModal(true)}
                    >
                        <FontAwesomeIcon icon={faPen} /> Edit resources
                    </Button>
                    <Button
                        color="secondary"
                        size="sm"
                        className="mt-2 me-1"
                        style={{ marginRight: 2 }}
                        onClick={() => setIsOpenRelatedFiguresModal(true)}
                    >
                        <FontAwesomeIcon icon={faPen} /> Edit figures
                    </Button>
                </>
            )}
            {isOpenRelatedResourcesModal && <RelatedResourcesModal toggle={() => setIsOpenRelatedResourcesModal((v) => !v)} />}
            {isOpenRelatedFiguresModal && <RelatedFiguresModal toggle={() => setIsOpenRelatedFiguresModal((v) => !v)} />}
            {isOpenVisualizationsModal && <VisualizationsModal toggle={() => setIsOpenVisualizationsModal((v) => !v)} />}
        </Container>
    ) : null;
};

export default ComparisonCarousel;
